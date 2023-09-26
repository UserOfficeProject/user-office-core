DO
$$
BEGIN
	IF register_patch('AddMissingProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2021-02-24') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_management_decision_submitted BOOLEAN DEFAULT FALSE;
            ALTER TABLE proposal_events ADD COLUMN proposal_all_sep_reviews_submitted BOOLEAN DEFAULT FALSE;
            ALTER TABLE proposal_events ADD COLUMN proposal_sep_review_updated BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;