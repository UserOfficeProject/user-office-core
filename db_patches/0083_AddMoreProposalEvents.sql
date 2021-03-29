DO
$$
BEGIN
	IF register_patch('AddFeasibilityReviewUpdatedProposalEvent.sql', 'martintrajanovski', 'Add more events to proposal_events', '2021-03-04') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_feasibility_review_updated BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;