DO
$$
BEGIN
	IF register_patch('AddProposalStatusUpdatedEvent.sql', 'martintrajanovski', 'Add proposal_status_updated event', '2021-03-19') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_status_updated BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;