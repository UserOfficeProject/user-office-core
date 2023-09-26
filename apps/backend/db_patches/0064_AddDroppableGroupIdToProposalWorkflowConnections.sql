

DO
$$
BEGIN
	IF register_patch('AddDroppableGroupIdToProposalWorkflowConnections.sql', 'martintrajanovski', 'Add droppable_group_id field to be able to group the connections easier', '2020-09-30') THEN
    BEGIN
        ALTER TABLE proposal_workflow_connections ADD COLUMN droppable_group_id VARCHAR(50) NOT NULL;
        ALTER TABLE proposal_workflow_connections ADD COLUMN parent_droppable_group_id VARCHAR(50);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;