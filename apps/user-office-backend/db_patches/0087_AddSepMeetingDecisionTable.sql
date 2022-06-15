DO
$$
BEGIN
	IF register_patch('AddSepMeetingDecisionTable.sql', 'martintrajanovski', 'Add SEP Meeting decision table to separate data from SEP meeting decision form.', '2021-03-19') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS "SEP_meeting_decisions" (
				proposal_id INT REFERENCES proposals(proposal_id) ON DELETE CASCADE,
				PRIMARY KEY(proposal_id),
				comment_for_management VARCHAR(500),
				comment_for_user VARCHAR(500),
				rank_order INT DEFAULT NULL,
				recommendation INT DEFAULT NULL,
				submitted BOOLEAN DEFAULT FALSE,
				submitted_by INT REFERENCES users(user_id) ON UPDATE CASCADE
			);
			END;
	END IF;
END;
$$
LANGUAGE plpgsql;