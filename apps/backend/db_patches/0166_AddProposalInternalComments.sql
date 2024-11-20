DO
$$
BEGIN
	IF register_patch('0166_AddProposalInternalCommentTable.sql', 'Farai Mutambara', 'Adding proposal internal comment table', '2024-11-19') THEN
		BEGIN
			CREATE TABLE IF NOT EXISTS proposal_internal_comments (
				comment_id SERIAL,
				proposal_pk INT REFERENCES proposals(proposal_pk) ON DELETE CASCADE,
				comment TEXT NOT NULL,
				PRIMARY KEY (comment_id, proposal_pk)
			);
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;