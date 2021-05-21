DO
$$
BEGIN
	IF register_patch('AddTechnicalReviewAssigneeColumn.sql', 'jekabskarklins', 'Add technical reviewer assignee to instrument_has_proposals table', '2021-04-29') THEN

        ALTER TABLE proposals ADD COLUMN technical_review_assignee INTEGER REFERENCES users (user_id) DEFAULT NULL;

	END IF;
END;
$$
LANGUAGE plpgsql;