DO
$$
BEGIN
	IF register_patch('AddProposalCallEndedInternalEvent.sql', 'Farai Mutambara', 'Add call ended internal field to proposal events table', '2022-08-25') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN call_ended_internal BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;