DO
$$
BEGIN
	IF register_patch('RemoveExecutedColumnFromConnectionHasActions.sql', 'martintrajanovski', 'Remove the executed flag as it is not useful for now.', '2023-10-26') THEN
	  BEGIN
			ALTER TABLE proposal_workflow_connection_has_actions DROP COLUMN executed;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;