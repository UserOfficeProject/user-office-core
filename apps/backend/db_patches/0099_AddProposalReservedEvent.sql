DO
$$
BEGIN
	IF register_patch('AddProposalReservedEvent.sql', 'martintrajanovski', 'Add proposal_reserved to proposal_events', '2021-07-05') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_reserved BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;