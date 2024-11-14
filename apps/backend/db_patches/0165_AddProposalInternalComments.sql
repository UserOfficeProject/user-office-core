DO
$$
BEGIN
	IF register_patch('0165_AddProposalInternalCommentTable.sql', 'Farai Mutambara', 'Adding proposal internal comment table', '2024-11-13') THEN
		BEGIN
			CREATE TABLE IF NOT EXISTS proposal_internal_comments (
				comment_id SERIAL PRIMARY KEY,
				proposal_pk INT REFERENCES proposals(proposal_pk) ON DELETE CASCADE,
				comment TEXT NOT NULL
			);
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;