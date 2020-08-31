

DO
$$
BEGIN
	IF register_patch('ConvertAnswerToJsonb.sql', 'jekabskarklins', 'Convert answer to JSONB', '2020-08-31') THEN
    BEGIN
        ALTER TABLE answers ALTER COLUMN answer TYPE jsonb USING answer::jsonb;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;