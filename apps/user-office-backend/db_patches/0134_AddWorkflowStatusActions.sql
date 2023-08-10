DO
$$
BEGIN
	IF register_patch('AddWorkflowStatusActions.sql', 'martintrajanovski', 'Workflow status actions for executing actions on proposal specific status', '2021-01-26') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS proposal_status_actions (
				proposal_status_action_id serial UNIQUE,
				name VARCHAR(64) NOT NULL,
				default_config jsonb,
				type VARCHAR(512) NOT NULL,
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;