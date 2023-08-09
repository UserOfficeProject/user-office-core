DO
$$
BEGIN
	IF register_patch('AddProposalClonedEvent.sql', 'martintrajanovski', 'Add proposal_cloned event', '2023-03-28') THEN
        BEGIN
            ALTER TABLE proposal_events
            ADD COLUMN proposal_cloned BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;
