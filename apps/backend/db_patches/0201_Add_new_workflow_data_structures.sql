DO
$$
BEGIN
    IF register_patch(
       'Add_new_workflow_data_structures',
       'Jekabs Karklins',
       'Add new workflow data structures for improved workflow management.',
       '2025-09-05'
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

            CONSTRAINT fk_wsc_workflow
              FOREIGN KEY (workflow_id) REFERENCES workflows (workflow_id),

            -- (1) Enforce that prev/next states belong to the same workflow by referencing
            --     the composite key on workflow_has_statuses.
            CONSTRAINT fk_wsc_prev_state
              FOREIGN KEY (workflow_id, prev_workflow_status_id)
              REFERENCES workflow_has_statuses (workflow_id, workflow_status_id),

            CONSTRAINT fk_wsc_next_state
              FOREIGN KEY (workflow_id, next_workflow_status_id)
              REFERENCES workflow_has_statuses (workflow_id, workflow_status_id)
          );

          -- (2) Prevent duplicate edges within a workflow.
          ALTER TABLE workflow_status_connections
            ADD CONSTRAINT uq_wsc_edge UNIQUE (workflow_id, prev_workflow_status_id, next_workflow_status_id);



          -- ============================================
          -- 3) workflow_status_changing_events (catalog)
          -- ============================================
          CREATE TABLE workflow_status_changing_events (
            status_changing_event_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name        TEXT NOT NULL,
            description TEXT
          );



          -- =====================================================================
          -- 4) workflow_status_connection_has_workflow_status_changing_events (edge→events)
          -- =====================================================================
          CREATE TABLE workflow_status_connection_has_workflow_status_changing_events (
            workflow_status_connection_id BIGINT NOT NULL,
            status_changing_event_id      BIGINT NOT NULL,

            CONSTRAINT pk_wsc_has_events
              PRIMARY KEY (workflow_status_connection_id, status_changing_event_id),

            CONSTRAINT fk_wsche_connection
              FOREIGN KEY (workflow_status_connection_id)
              REFERENCES workflow_status_connections (workflow_status_connection_id),

            CONSTRAINT fk_wsche_event
              FOREIGN KEY (status_changing_event_id)
              REFERENCES workflow_status_changing_events (status_changing_event_id)
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
            config                        JSONB  NOT NULL DEFAULT '{}'::jsonb,

            CONSTRAINT pk_wsc_has_actions
              PRIMARY KEY (workflow_status_connection_id, workflow_status_action_id),

            CONSTRAINT fk_wsca_workflow
              FOREIGN KEY (workflow_id)
              REFERENCES workflows (workflow_id),

            CONSTRAINT fk_wsca_connection
              FOREIGN KEY (workflow_status_connection_id)
              REFERENCES workflow_status_connections (workflow_status_connection_id),

            CONSTRAINT fk_wsca_action
              FOREIGN KEY (workflow_status_action_id)
              REFERENCES workflow_status_actions (workflow_status_action_id)
          );

            

          -- ==================================================================
          -- 6) proposal_has_workflow_status_changing_events (instance-scoped events)
          -- ==================================================================
          CREATE TABLE proposal_has_workflow_status_changing_events (
            proposal_has_workflow_status_changing_events_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            status_changing_event_id INT  NOT NULL,
            proposal_pk              INT  NOT NULL,
            created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

            CONSTRAINT fk_phsce_event
              FOREIGN KEY (status_changing_event_id)
              REFERENCES workflow_status_changing_events (status_changing_event_id),

            CONSTRAINT fk_phsce_proposal
              FOREIGN KEY (proposal_pk)
              REFERENCES proposals (proposal_pk)
          );

          -- Ensure at most one row per (proposal, event) in the current accumulation window.
          -- (If you retain rows across state changes, you can reset the window in code
          --  by comparing against proposals.state_entered_at.)
          CREATE UNIQUE INDEX uq_phsce_proposal_event
            ON proposal_has_workflow_status_changing_events (proposal_pk, status_changing_event_id);

          -- Optional helper index for proposal lookups:
          CREATE INDEX ix_phsce_proposal
            ON proposal_has_workflow_status_changing_events (proposal_pk);
            
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
