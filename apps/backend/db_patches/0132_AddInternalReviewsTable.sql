DO
$$
BEGIN
	IF register_patch('AddInternalReviewsTable.sql', 'martintrajanovski', 'Add internal_reviews table', '2023-06-20') THEN
    CREATE TABLE IF NOT EXISTS
      internal_reviews(
        internal_review_id SERIAL PRIMARY KEY,
        title TEXT,
        comment TEXT,
        files jsonb,
        reviewer_id INT REFERENCES users (user_id) ON DELETE SET NULL,
        technical_review_id INT REFERENCES technical_review (technical_review_id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        assigned_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
      );
	END IF;
END;
$$
LANGUAGE plpgsql;
