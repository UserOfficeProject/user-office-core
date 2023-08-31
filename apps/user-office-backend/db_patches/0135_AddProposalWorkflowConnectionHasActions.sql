DO
$$
BEGIN
	IF register_patch('AddProposalWorkflowConnectionHasActions.sql', 'martintrajanovski', 'Proposal workflow connection needs to contain additional information about what action should be executed', '2021-01-26') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS proposal_workflow_connection_has_actions (
				connection_id int REFERENCES proposal_workflow_connections (proposal_workflow_connection_id) ON DELETE CASCADE,
      	action_id int REFERENCES proposal_status_actions (proposal_status_action_id) ON DELETE CASCADE,
      	workflow_id int REFERENCES proposal_workflows (proposal_workflow_id) ON DELETE CASCADE,
				executed BOOLEAN DEFAULT FALSE,
				config jsonb,
      	CONSTRAINT connection_has_actions_pkey PRIMARY KEY (connection_id, action_id)  -- explicit pk
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;