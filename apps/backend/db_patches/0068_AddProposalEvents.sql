DO
$$
BEGIN
	IF register_patch('AddProposalEvents.sql', 'martintrajanovski', 'Add proposal events table to keep track of all fired events on a proposal.', '2020-10-22') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS proposal_events (
				proposal_id INT REFERENCES proposals(proposal_id) ON DELETE CASCADE,
				PRIMARY KEY(proposal_id),
				proposal_created BOOLEAN DEFAULT FALSE,
				proposal_submitted BOOLEAN DEFAULT FALSE,
				call_ended BOOLEAN DEFAULT FALSE,
				proposal_sep_selected BOOLEAN DEFAULT FALSE,
				proposal_instrument_selected BOOLEAN DEFAULT FALSE,
				proposal_feasibility_review_submitted BOOLEAN DEFAULT FALSE,
				proposal_sample_review_submitted BOOLEAN DEFAULT FALSE,
				proposal_all_sep_reviewers_selected BOOLEAN DEFAULT FALSE,
				proposal_sep_review_submitted BOOLEAN DEFAULT FALSE,
				proposal_sep_meeting_submitted BOOLEAN DEFAULT FALSE,
				proposal_instrument_submitted BOOLEAN DEFAULT FALSE,
				proposal_accepted BOOLEAN DEFAULT FALSE,
				proposal_rejected BOOLEAN DEFAULT FALSE,
				proposal_notified BOOLEAN DEFAULT FALSE
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;