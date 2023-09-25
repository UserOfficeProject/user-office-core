DO
$$
BEGIN
	IF register_patch('AddProposalSepMeetingReorderedEvent.sql', 'martintrajanovski', 'Add proposal_sep_meeting_reorder event', '2021-04-06') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_sep_meeting_reorder BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;