DO
$$
BEGIN
	IF register_patch('AddProposalStatusActionExecutedEvent.sql', 'martintrajanovski', 'Add proposal_status_action_executed event', '2023-11-07') THEN
        BEGIN
            ALTER TABLE proposal_events
            ADD COLUMN proposal_status_action_executed BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;