DO
$$
BEGIN
    IF register_patch('TopicLastEdited.sql', 'TCMeldrum', 'Update topic to include last edited timestamp', '2026-08-07') THEN

        ALTER TABLE IF EXISTS answers ADD COLUMN last_edited TIMESTAMP WITH TIME ZONE;
        update answers set last_edited = created_at;

    END IF;
END;
$$
LANGUAGE plpgsql;