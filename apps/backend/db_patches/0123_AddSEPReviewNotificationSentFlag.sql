DO
$$
BEGIN
    IF register_patch('AddSEPReviewNotificationSentFlag.sql', 'Martin Trajanovski', 'Add notification email sent flag to SEP reviews', '2022-06-08') THEN

        ALTER TABLE "SEP_Reviews"
        ADD COLUMN notification_email_sent boolean DEFAULT false;

    END IF;
END;
$$
LANGUAGE plpgsql;