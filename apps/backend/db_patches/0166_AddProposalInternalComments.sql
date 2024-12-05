DO
$$
BEGIN
	IF register_patch('0166_AddProposalInternalCommentTable.sql', 'Farai Mutambara', 'Adding proposal internal comment table', '2024-11-29') THEN
		BEGIN
			CREATE TABLE IF NOT EXISTS proposal_internal_comments (
				comment_id SERIAL,
				proposal_pk INT REFERENCES proposals(proposal_pk) ON DELETE CASCADE,
				comment TEXT NOT NULL,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				PRIMARY KEY (comment_id, proposal_pk)
			);

			CREATE TRIGGER set_timestamp
			BEFORE UPDATE ON proposal_internal_comments
			FOR EACH ROW
			EXECUTE PROCEDURE trigger_set_timestamp();
		
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;