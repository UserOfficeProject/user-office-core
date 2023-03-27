DO
$$
BEGIN
	IF register_patch('AddProposalDeletedEvent.sql', 'martintrajanovski', 'Add proposal_deleted event', '2023-01-24') THEN
        BEGIN
            ALTER TABLE proposal_events
            ADD COLUMN proposal_deleted BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;