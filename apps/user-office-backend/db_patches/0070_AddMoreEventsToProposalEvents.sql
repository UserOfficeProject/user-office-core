DO
$$
BEGIN
	IF register_patch('AddMoreEventsToProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2020-11-02') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN call_review_ended BOOLEAN DEFAULT FALSE;
            ALTER TABLE proposal_events ADD COLUMN call_sep_review_ended BOOLEAN DEFAULT FALSE;
            ALTER TABLE proposal_events ADD COLUMN proposal_feasible BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;