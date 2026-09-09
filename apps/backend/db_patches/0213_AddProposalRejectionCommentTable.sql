DO
$$
BEGIN
	IF register_patch('0213_AddProposalRejectionCommentTable.sql', 'Ellen Wright', 'Adding proposal rejection comment table', '2026-06-15') THEN
		BEGIN
			CREATE TABLE IF NOT EXISTS proposal_rejection_comments (
				comment_id SERIAL,
				proposal_pk INT REFERENCES proposals(proposal_pk),
				comment TEXT NOT NULL,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				PRIMARY KEY (comment_id)
			);

			CREATE TRIGGER set_timestamp
			BEFORE UPDATE ON proposal_rejection_comments
			FOR EACH ROW
			EXECUTE PROCEDURE trigger_set_timestamp();
		
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;