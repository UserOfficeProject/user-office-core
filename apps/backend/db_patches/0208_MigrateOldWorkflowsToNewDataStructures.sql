DO
$$
DECLARE
    v_node_count BIGINT;
    v_workflow_status_id INT;
    v_prev_workflow_status_id INT;
    v_next_workflow_status_id INT;
    v_connection_id INT;
    v_unmapped_actions BIGINT := 0;
    v_unmapped_events BIGINT := 0;
    v_logs_updated BIGINT := 0;
    v_unmapped_logs BIGINT := 0;
    has_status_actions_logs BOOLEAN := FALSE;
    call_has_workflow_id BOOLEAN := FALSE;
    call_has_proposal_workflow_id BOOLEAN := FALSE;
    v_proposals_updated BIGINT := 0;
    v_unmapped_proposals BIGINT := 0;
    node_rec RECORD;
    edge_rec RECORD;
BEGIN
    IF register_patch(
       'Migrate_workflow',
       'Jekabs Karklins',
       'Migrate workflow data to new structures.',
       '2026-01-05'
     ) THEN
      BEGIN
        SELECT COUNT(*) INTO v_node_count FROM workflow_connections;

        IF v_node_count = 0 THEN
          RAISE NOTICE 'No workflow connections to migrate. Continuing with cleanup.';
        END IF;

        PERFORM 1 FROM workflow_has_statuses LIMIT 1;
        IF FOUND THEN
          RAISE EXCEPTION 'workflow_has_statuses already contains rows. Migration must run on an empty target table.';
        END IF;

        PERFORM 1 FROM workflow_status_connections LIMIT 1;
        IF FOUND THEN
          RAISE EXCEPTION 'workflow_status_connections already contains rows. Migration must run on an empty target table.';
        END IF;

        PERFORM 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'status_actions_logs';

        IF FOUND THEN
          has_status_actions_logs := TRUE;

          ALTER TABLE status_actions_logs
            DROP CONSTRAINT IF EXISTS status_actions_logs_connection_id_action_id_fkey,
            DROP CONSTRAINT IF EXISTS status_actions_logs_connection_id_fkey,
            DROP CONSTRAINT IF EXISTS status_actions_logs_action_id_fkey;
        END IF;

        SELECT EXISTS (
                 SELECT 1
                 FROM information_schema.columns
                 WHERE table_schema = 'public'
                   AND table_name = 'call'
                   AND column_name = 'workflow_id'
               )
          INTO call_has_workflow_id;

        SELECT EXISTS (
                 SELECT 1
                 FROM information_schema.columns
                 WHERE table_schema = 'public'
                   AND table_name = 'call'
                   AND column_name = 'proposal_workflow_id'
               )
          INTO call_has_proposal_workflow_id;

        IF NOT call_has_workflow_id AND NOT call_has_proposal_workflow_id THEN
          RAISE EXCEPTION 'call table must expose either workflow_id or proposal_workflow_id to migrate proposals.';
        END IF;

        CREATE TEMP TABLE tmp_workflow_status_map (
          workflow_connection_id INT PRIMARY KEY,
          workflow_status_id INT NOT NULL
        ) ON COMMIT DROP;

        CREATE TEMP TABLE tmp_workflow_edge_map (
          workflow_connection_id INT PRIMARY KEY,
          workflow_status_connection_id INT NOT NULL
        ) ON COMMIT DROP;

        FOR node_rec IN
          SELECT workflow_connection_id,
                 workflow_id,
                 status_id,
                 COALESCE(pos_x, 0) AS pos_x,
                 COALESCE(pos_y, 0) AS pos_y
          FROM workflow_connections
          ORDER BY workflow_connection_id
        LOOP
          INSERT INTO workflow_has_statuses (workflow_id, status_id, pos_x, pos_y)
          VALUES (node_rec.workflow_id, node_rec.status_id, node_rec.pos_x, node_rec.pos_y)
          RETURNING workflow_status_id INTO v_workflow_status_id;

          INSERT INTO tmp_workflow_status_map (workflow_connection_id, workflow_status_id)
          VALUES (node_rec.workflow_connection_id, v_workflow_status_id);
        END LOOP;

        FOR edge_rec IN
          SELECT workflow_connection_id,
                 workflow_id,
                 prev_connection_id
          FROM workflow_connections
          WHERE prev_connection_id IS NOT NULL
          ORDER BY workflow_connection_id
        LOOP
          SELECT workflow_status_id
          INTO STRICT v_prev_workflow_status_id
          FROM tmp_workflow_status_map
          WHERE workflow_connection_id = edge_rec.prev_connection_id;

          SELECT workflow_status_id
          INTO STRICT v_next_workflow_status_id
          FROM tmp_workflow_status_map
          WHERE workflow_connection_id = edge_rec.workflow_connection_id;

          v_connection_id := NULL;

          INSERT INTO workflow_status_connections (workflow_id, prev_workflow_status_id, next_workflow_status_id)
          VALUES (edge_rec.workflow_id, v_prev_workflow_status_id, v_next_workflow_status_id)
          ON CONFLICT (workflow_id, prev_workflow_status_id, next_workflow_status_id) DO NOTHING
          RETURNING workflow_status_connection_id INTO v_connection_id;

          IF v_connection_id IS NULL THEN
            SELECT workflow_status_connection_id
            INTO STRICT v_connection_id
            FROM workflow_status_connections
            WHERE workflow_id = edge_rec.workflow_id
              AND prev_workflow_status_id = v_prev_workflow_status_id
              AND next_workflow_status_id = v_next_workflow_status_id;
          END IF;

          INSERT INTO tmp_workflow_edge_map (workflow_connection_id, workflow_status_connection_id)
          VALUES (edge_rec.workflow_connection_id, v_connection_id)
          ON CONFLICT (workflow_connection_id) DO UPDATE
          SET workflow_status_connection_id = EXCLUDED.workflow_status_connection_id;
        END LOOP;

        INSERT INTO workflow_status_connection_has_workflow_status_actions (
          workflow_status_connection_id,
          workflow_status_action_id,
          workflow_id,
          config
        )
        SELECT edge_map.workflow_status_connection_id,
               action.action_id,
               COALESCE(action.workflow_id, conn.workflow_id),
               COALESCE(action.config, '{}'::jsonb)
        FROM workflow_connection_has_actions action
        JOIN tmp_workflow_edge_map edge_map
          ON edge_map.workflow_connection_id = action.connection_id
        JOIN workflow_connections conn
          ON conn.workflow_connection_id = action.connection_id;

        SELECT COUNT(*) INTO v_unmapped_actions
        FROM workflow_connection_has_actions action
        LEFT JOIN tmp_workflow_edge_map edge_map
          ON edge_map.workflow_connection_id = action.connection_id
        WHERE edge_map.workflow_connection_id IS NULL;

        IF v_unmapped_actions > 0 THEN
          RAISE WARNING USING MESSAGE = format('%s workflow actions could not be migrated because their connection does not reference a previous node.', v_unmapped_actions);
        END IF;

        INSERT INTO workflow_status_connection_has_workflow_status_changing_events (
          workflow_status_connection_id,
          status_changing_event
        )
        SELECT edge_map.workflow_status_connection_id,
               events.status_changing_event::text
        FROM status_changing_events events
        JOIN tmp_workflow_edge_map edge_map
          ON edge_map.workflow_connection_id = events.workflow_connection_id;

        SELECT COUNT(*) INTO v_unmapped_events
        FROM status_changing_events events
        LEFT JOIN tmp_workflow_edge_map edge_map
          ON edge_map.workflow_connection_id = events.workflow_connection_id
        WHERE edge_map.workflow_connection_id IS NULL;

        IF v_unmapped_events > 0 THEN
          RAISE WARNING USING MESSAGE = format('%s workflow events could not be migrated because their connection does not reference a previous node.', v_unmapped_events);
        END IF;

        IF has_status_actions_logs THEN
          UPDATE status_actions_logs sal
          SET connection_id = edge_map.workflow_status_connection_id
          FROM workflow_connection_has_actions action
          JOIN tmp_workflow_edge_map edge_map
            ON edge_map.workflow_connection_id = action.connection_id
          WHERE sal.connection_id = action.connection_id
            AND sal.action_id = action.action_id;

          GET DIAGNOSTICS v_logs_updated = ROW_COUNT;

          SELECT COUNT(*) INTO v_unmapped_logs
          FROM status_actions_logs sal
          LEFT JOIN workflow_connection_has_actions action
            ON action.connection_id = sal.connection_id
           AND action.action_id = sal.action_id
          LEFT JOIN tmp_workflow_edge_map edge_map
            ON edge_map.workflow_connection_id = action.connection_id
          WHERE edge_map.workflow_connection_id IS NULL;

          IF v_unmapped_logs > 0 THEN
            RAISE WARNING USING MESSAGE = format('%s status action logs could not be remapped because their workflow connection is missing a previous node.', v_unmapped_logs);
          END IF;

          ALTER TABLE status_actions_logs
            ADD CONSTRAINT status_actions_logs_connection_id_fkey
              FOREIGN KEY (connection_id)
              REFERENCES workflow_status_connections (workflow_status_connection_id)
              ON DELETE CASCADE,
            ADD CONSTRAINT status_actions_logs_action_id_fkey
              FOREIGN KEY (action_id)
              REFERENCES workflow_status_actions (workflow_status_action_id)
              ON DELETE CASCADE;
        END IF;

        CREATE TEMP TABLE tmp_call_workflow_map (
          call_id INT PRIMARY KEY,
          workflow_id INT
        ) ON COMMIT DROP;

        IF call_has_proposal_workflow_id THEN
          INSERT INTO tmp_call_workflow_map (call_id, workflow_id)
          SELECT call_id, proposal_workflow_id
          FROM call
          WHERE proposal_workflow_id IS NOT NULL;
        END IF;

        IF call_has_workflow_id THEN
          INSERT INTO tmp_call_workflow_map (call_id, workflow_id)
          SELECT call_id, workflow_id
          FROM call
          WHERE workflow_id IS NOT NULL
          ON CONFLICT (call_id) DO UPDATE
            SET workflow_id = COALESCE(EXCLUDED.workflow_id, tmp_call_workflow_map.workflow_id);
        END IF;

        CREATE TEMP TABLE tmp_workflow_status_lookup (
          workflow_id INT NOT NULL,
          status_id INT NOT NULL,
          workflow_status_id INT NOT NULL,
          PRIMARY KEY (workflow_id, status_id)
        ) ON COMMIT DROP;

        INSERT INTO tmp_workflow_status_lookup (workflow_id, status_id, workflow_status_id)
        SELECT workflow_id,
               status_id,
               MIN(workflow_status_id) AS workflow_status_id
        FROM workflow_has_statuses
        GROUP BY workflow_id, status_id;

        WITH proposal_status_matches AS (
          SELECT p.proposal_pk,
                 lookup.workflow_status_id
          FROM proposals p
          JOIN tmp_call_workflow_map call_map
            ON call_map.call_id = p.call_id
          JOIN tmp_workflow_status_lookup lookup
            ON lookup.workflow_id = call_map.workflow_id
           AND lookup.status_id = p.status_id
        )
        UPDATE proposals p
        SET workflow_status_id = matches.workflow_status_id
        FROM proposal_status_matches matches
        WHERE matches.proposal_pk = p.proposal_pk;

        GET DIAGNOSTICS v_proposals_updated = ROW_COUNT;

        SELECT COUNT(*)
        INTO v_unmapped_proposals
        FROM proposals p
        LEFT JOIN tmp_call_workflow_map call_map
          ON call_map.call_id = p.call_id
        LEFT JOIN tmp_workflow_status_lookup lookup
          ON lookup.workflow_id = call_map.workflow_id
         AND lookup.status_id = p.status_id
        WHERE p.workflow_status_id IS NULL
          AND call_map.workflow_id IS NOT NULL
          AND p.status_id IS NOT NULL;

        IF v_proposals_updated = 0 THEN
          RAISE NOTICE 'No proposals required workflow_status_id backfill.';
        ELSE
          RAISE NOTICE USING MESSAGE = format('%s proposals updated with workflow_status_id.', v_proposals_updated);
        END IF;

        IF v_unmapped_proposals > 0 THEN
          RAISE WARNING USING MESSAGE = format('%s proposals could not be mapped to workflow_status_id during migration.', v_unmapped_proposals);
        END IF;

        DROP TABLE IF EXISTS workflow_connection_has_actions;
        DROP TABLE IF EXISTS status_changing_events;
        DROP TABLE IF EXISTS workflow_connections;
        DROP SEQUENCE IF EXISTS proposal_workflow_connections_proposal_workflow_connection__seq;
        DROP SEQUENCE IF EXISTS next_status_events_next_status_event_id_seq;

        DROP TABLE IF EXISTS proposal_events;
        DROP TABLE IF EXISTS experiment_safety_events;
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
