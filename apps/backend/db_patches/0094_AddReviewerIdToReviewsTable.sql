DO
$$
BEGIN
	IF register_patch('AddReviewerIdToReviewsTable.sql', 'jekabskarklins', 'Add technical reviewer id reviews table', '2021-05-04') THEN

        ALTER TABLE technical_review ADD COLUMN reviewer_id INTEGER NOT NULL REFERENCES users (user_id) DEFAULT 0;
		ALTER TABLE technical_review ALTER COLUMN reviewer_id DROP DEFAULT;
	END IF;
END;
$$
LANGUAGE plpgsql;