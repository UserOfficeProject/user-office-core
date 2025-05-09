DO
$$
BEGIN
	IF register_patch('0180_AddFapReviewerNotifiedEvent.sql', 'TCMeldrum', 'Add missing FAP_REVIEWER_NOTIFIED', '2025-05-01') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN FAP_REVIEWER_NOTIFIED BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;