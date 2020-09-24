

DO
$$
BEGIN
	IF register_patch('AddSortOrderToProposalWorkflowConnections.sql', 'martintrajanovski', 'Add sort_order field to be able to sort the connections easier', '2020-09-24') THEN
    BEGIN
        ALTER TABLE proposal_workflow_connections ADD COLUMN sort_order INTEGER NOT NULL;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;