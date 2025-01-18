DO
$$
BEGIN
  IF register_patch('0168_ExperimentWorkflow', 'Yoganandan Pandiyan', 'Generalising Workflow and Statuses for supporting Experiments and Proposals', '2025-01-16') THEN
    BEGIN
      /* altering table names*/
      ALTER TABLE proposal_statuses RENAME TO statuses;
      ALTER TABLE proposal_status_actions RENAME TO status_actions;
      ALTER TABLE proposal_workflows RENAME TO workflows;
      ALTER TABLE proposal_workflow_connections RENAME TO workflow_connections;
      ALTER TABLE proposal_workflow_connection_has_actions RENAME TO workflow_connection_has_actions;
    END;

    BEGIN
      /* Renaming the columns */
      ALTER TABLE statuses RENAME COLUMN proposal_status_id TO status_id;
      ALTER TABLE status_actions RENAME COLUMN proposal_status_action_id TO status_action_id;
      ALTER TABLE workflows RENAME COLUMN proposal_workflow_id TO workflow_id;
      ALTER TABLE workflow_connections RENAME COLUMN proposal_workflow_connection_id TO workflow_connection_id;
      ALTER TABLE workflow_connections RENAME COLUMN proposal_workflow_id TO workflow_id;
      ALTER TABLE workflow_connections RENAME COLUMN proposal_status_id TO status_id;
      ALTER TABLE workflow_connections RENAME COLUMN next_proposal_status_id TO next_status_id;
      ALTER TABLE workflow_connections RENAME COLUMN prev_proposal_status_id TO prev_status_id;
      ALTER TABLE status_changing_events RENAME COLUMN proposal_workflow_connection_id TO workflow_connection_id;
    END;

    BEGIN
      /* Creating enum for entity_type */
      CREATE TYPE entity_type AS ENUM ('proposal', 'experiment');
    END;

    BEGIN
      /* Adding entity_type column to the workflow and status related tables. Set the default to proposal temporarily, so that the existing record get populated with the value as proposal. Remove the default value after this. */
      ALTER TABLE statuses ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'proposal';
      ALTER TABLE workflows ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'proposal';
      ALTER TABLE workflow_connections ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'proposal';
      ALTER TABLE workflow_connection_has_actions ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'proposal';
      ALTER TABLE status_changing_events ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'proposal';
    END;  

    BEGIN
      /* Drop the default value of proposal */
      ALTER TABLE statuses ALTER COLUMN entity_type DROP DEFAULT;
      ALTER TABLE workflows ALTER COLUMN entity_type DROP DEFAULT;
      ALTER TABLE workflow_connections ALTER COLUMN entity_type DROP DEFAULT;
      ALTER TABLE workflow_connection_has_actions ALTER COLUMN entity_type DROP DEFAULT;
      ALTER TABLE status_changing_events ALTER COLUMN entity_type DROP DEFAULT;
    END;

    BEGIN
      /* Adding unique constraint for entity_type and status_id in statuses table */
      ALTER TABLE statuses ADD CONSTRAINT statuses_status_id_entity_type_uniq_key UNIQUE (status_id, entity_type);
      ALTER TABLE workflows ADD CONSTRAINT workflows_workflow_id_entity_type_uniq_key UNIQUE (workflow_id, entity_type);
      ALTER TABLE workflow_connections ADD CONSTRAINT workflow_connections_workflow_connection_id_entity_type_uniq_key UNIQUE (workflow_connection_id, entity_type);
    END;

    BEGIN
      /* Need to attach entity_type along with existing fk as a composite foreign key to avoid inconsitencies in entity_type across the tables.  */
      /* Dropping existing foreign key constraints */
      ALTER TABLE workflow_connections 
        DROP CONSTRAINT proposal_workflow_connections_proposal_workflow_id_fkey,
        DROP CONSTRAINT proposal_workflow_connections_proposal_status_id_fkey,
        DROP CONSTRAINT proposal_workflow_connections_next_proposal_status_id_fkey,
        DROP CONSTRAINT proposal_workflow_connections_prev_proposal_status_id_fkey;
      
      ALTER TABLE workflow_connection_has_actions
        DROP CONSTRAINT proposal_workflow_connection_has_actions_connection_id_fkey,
        DROP CONSTRAINT proposal_workflow_connection_has_actions_workflow_id_fkey;
      
      ALTER TABLE status_changing_events
        DROP CONSTRAINT next_status_events_proposal_workflow_connection_id_fkey;
    END;

    BEGIN
      /* Adding back the foreign key constraints with entity_type(Composite FOreign Key) */
      ALTER TABLE workflow_connections 
        ADD CONSTRAINT workflow_connections_workflow_id_fkey FOREIGN KEY (workflow_id, entity_type) REFERENCES workflows (workflow_id, entity_type) ON DELETE CASCADE,
        ADD CONSTRAINT workflow_connections_status_id_fkey FOREIGN KEY (status_id, entity_type) REFERENCES statuses (status_id, entity_type) ON DELETE CASCADE,
        ADD CONSTRAINT workflow_connections_next_status_id_fkey FOREIGN KEY (next_status_id, entity_type) REFERENCES statuses (status_id, entity_type) ON DELETE CASCADE,
        ADD CONSTRAINT workflow_connections_prev_status_id_fkey FOREIGN KEY (prev_status_id, entity_type) REFERENCES statuses (status_id, entity_type) ON DELETE CASCADE;

      ALTER TABLE workflow_connection_has_actions
        ADD CONSTRAINT workflow_connection_has_actions_connection_id_fkey FOREIGN KEY (connection_id, entity_type) REFERENCES workflow_connections (workflow_connection_id, entity_type) ON DELETE CASCADE,
        ADD CONSTRAINT workflow_connection_has_actions_workflow_id_fkey FOREIGN KEY (workflow_id, entity_type) REFERENCES workflows (workflow_id, entity_type) ON DELETE CASCADE;

      ALTER TABLE status_changing_events
        ADD CONSTRAINT status_events_workflow_connection_id_fkey FOREIGN KEY (workflow_connection_id, entity_type) REFERENCES workflow_connections (workflow_connection_id, entity_type) ON DELETE CASCADE;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
