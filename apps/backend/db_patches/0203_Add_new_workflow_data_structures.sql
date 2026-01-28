DO
$$
BEGIN
    IF register_patch(
       'Add_new_workflow_data_structures',
       'Jekabs Karklins',
       'Add new workflow data structures for improved workflow management.',
       '2025-12-20'
     ) THEN
      BEGIN



          -- ===============================
          -- 1) workflow_has_statuses
          -- ===============================
          CREATE TABLE workflow_has_statuses (
            workflow_status_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            workflow_id             INT NOT NULL,
            status_id               INT NOT NULL,
            pos_x                   INT NOT NULL DEFAULT 0,
            pos_y                   INT NOT NULL DEFAULT 0,

            CONSTRAINT fk_whs_workflow
              FOREIGN KEY (workflow_id) REFERENCES workflows (workflow_id),

            CONSTRAINT fk_whs_status
              FOREIGN KEY (status_id)   REFERENCES statuses   (status_id)
          );

          -- (1) Make (workflow_id, workflow_status_id) uniquely addressable so we can
          --     use it as a composite FK target from transitions.
          ALTER TABLE workflow_has_statuses
            ADD CONSTRAINT uq_whs_workflow_and_state UNIQUE (workflow_id, workflow_status_id);



          -- ===============================
          -- 2) workflow_status_connections
          -- ===============================
          CREATE TABLE workflow_status_connections (
            workflow_status_connection_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            workflow_id                   INT NOT NULL,
            prev_workflow_status_id       INT NOT NULL,
            next_workflow_status_id       INT NOT NULL,
            source_handle                 VARCHAR(255) NOT NULL DEFAULT 'bottom-source',
            target_handle                 VARCHAR(255) NOT NULL DEFAULT 'top-target',

            CONSTRAINT fk_wsc_workflow
              FOREIGN KEY (workflow_id) REFERENCES workflows (workflow_id),

            -- (1) Enforce that prev/next states belong to the same workflow by referencing
            --     the composite key on workflow_has_statuses.
            CONSTRAINT fk_wsc_prev_state
              FOREIGN KEY (workflow_id, prev_workflow_status_id)
              REFERENCES workflow_has_statuses (workflow_id, workflow_status_id)
              ON DELETE CASCADE,

            CONSTRAINT fk_wsc_next_state
              FOREIGN KEY (workflow_id, next_workflow_status_id)
              REFERENCES workflow_has_statuses (workflow_id, workflow_status_id)
              ON DELETE CASCADE
          );

          -- (2) Prevent duplicate edges within a workflow.
          ALTER TABLE workflow_status_connections
            ADD CONSTRAINT uq_wsc_edge UNIQUE (workflow_id, prev_workflow_status_id, next_workflow_status_id);



          -- ============================================
          -- 3) workflow_status_changing_events (catalog)
          -- ============================================
          -- REMOVED: workflow_status_changing_events table is removed.
          -- Events are now stored as strings in the code (apps/backend/src/events/event.enum.ts).




          -- =====================================================================
          -- 4) workflow_status_connection_has_workflow_status_changing_events (edge→events)
          -- =====================================================================
          CREATE TABLE workflow_status_connection_has_workflow_status_changing_events (
            workflow_status_connection_id BIGINT NOT NULL,
            status_changing_event         TEXT NOT NULL,

            CONSTRAINT pk_wsc_has_events
              PRIMARY KEY (workflow_status_connection_id, status_changing_event),

            CONSTRAINT fk_wsche_connection
              FOREIGN KEY (workflow_status_connection_id)
              REFERENCES workflow_status_connections (workflow_status_connection_id)
              ON DELETE CASCADE
          );

          -- The composite PK already prevents duplicates for (connection, event).


          -- Rename existing status_actions table to workflow_status_actions
          ALTER TABLE status_actions RENAME TO workflow_status_actions;
          ALTER table workflow_status_actions
            RENAME COLUMN status_action_id TO workflow_status_action_id;

          -- ==========================================================
          -- 5) workflow_status_connection_has_workflow_status_actions (edge→actions)
          -- ==========================================================
          CREATE TABLE workflow_status_connection_has_workflow_status_actions (
            workflow_status_connection_id INT NOT NULL,
            workflow_status_action_id     INT NOT NULL,
            workflow_id                   INT NOT NULL,
            config                        JSONB,

            CONSTRAINT pk_wsc_has_actions
              PRIMARY KEY (workflow_status_connection_id, workflow_status_action_id),

            CONSTRAINT fk_wsca_workflow
              FOREIGN KEY (workflow_id)
              REFERENCES workflows (workflow_id),

            CONSTRAINT fk_wsca_connection
              FOREIGN KEY (workflow_status_connection_id)
              REFERENCES workflow_status_connections (workflow_status_connection_id)
              ON DELETE CASCADE,

            CONSTRAINT fk_wsca_action
              FOREIGN KEY (workflow_status_action_id)
              REFERENCES workflow_status_actions (workflow_status_action_id)
          );

          -- ==================================================================
          -- 7) Link proposals to the new workflow graph
          -- ==================================================================
          ALTER TABLE proposals
            ADD COLUMN workflow_status_id INT NULL;

          ALTER TABLE proposals
            ADD CONSTRAINT fk_proposals_workflow_status
            FOREIGN KEY (workflow_status_id)
            REFERENCES workflow_has_statuses (workflow_status_id);
            
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
