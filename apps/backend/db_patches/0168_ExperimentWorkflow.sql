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
      CREATE TYPE entity_type AS ENUM ('PROPOSAL', 'EXPERIMENT');
    END;

    BEGIN
      /* Adding entity_type column to the workflow and status related tables. Set the default to proposal temporarily, so that the existing record get populated with the value as proposal. Remove the default value after this. */
      ALTER TABLE statuses ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'PROPOSAL';
      ALTER TABLE workflows ADD COLUMN entity_type entity_type NOT NULL DEFAULT 'PROPOSAL';
    END;  

    BEGIN
      /* Drop the default value of proposal */
      ALTER TABLE statuses ALTER COLUMN entity_type DROP DEFAULT;
      ALTER TABLE workflows ALTER COLUMN entity_type DROP DEFAULT;
    END;

    BEGIN
      -- Insert the Workflow Statuses
      INSERT INTO statuses (name, short_code, description, entity_type, is_default) VALUES ('AWAITING ESF', 'AWAITING_ESF', 'When an Experiment is created, the default status will be AWAITING_ESF. This means that the experimenter needs to submit the ESF(Experiment Safety Form).', 'EXPERIMENT', true);
      INSERT INTO statuses (name, short_code, description, entity_type, is_default) VALUES ('ESF IS REVIEW', 'ESF_IS_REVIEW', 'IS(Instrument Scientist) needs to review the ESF.', 'EXPERIMENT', true);
      INSERT INTO statuses (name, short_code, description, entity_type, is_default) VALUES ('ESF ESR REVIEW', 'ESF_ESR_REVIEW', 'ESR(Experiment Safety Reviewer) needs to review the ESF.', 'EXPERIMENT', true);
      INSERT INTO statuses (name, short_code, description, entity_type, is_default) VALUES ('ESF REJECTED', 'ESF_REJECTED', 'ESF rejected.', 'EXPERIMENT', true);
      INSERT INTO statuses (name, short_code, description, entity_type, is_default) VALUES ('ESF APROVED', 'ESF_APROVED', 'ESF approved.', 'EXPERIMENT', true);
    END;

  END IF;
END;
$$
LANGUAGE plpgsql;
