DO
$$
BEGIN
	IF register_patch('AddProposalSampleSafeEventToProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2020-11-17') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_sample_safe BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;