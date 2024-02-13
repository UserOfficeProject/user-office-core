DO
$$
BEGIN
	IF register_patch('ReviewMeetings.sql', 'krzysztofklimczyk', 'Add table review_meetings ', '2024-02-01') THEN
	BEGIN
		CREATE TABLE review_meetings (
			review_meeting_id serial PRIMARY KEY
			, name    varchar(100) NOT NULL 
			, details  text 
			, instrument_id  int REFERENCES instruments (instrument_id) NOT NULL 
			, creator_id  int REFERENCES users (user_id) NOT NULL 
			, occurs_at TIMESTAMPTZ NOT NULL 
			, notified BOOLEAN NOT NULL DEFAULT FALSE
			, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);

		CREATE TABLE review_meeting_has_users (
				review_meeting_id INTEGER NOT NULL REFERENCES review_meetings (review_meeting_id) ON DELETE CASCADE,
				user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE, 
				PRIMARY KEY (review_meeting_id, user_id)
			);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;