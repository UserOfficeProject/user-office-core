

DO
$$
BEGIN
	IF register_patch('AddSampleSafetyReviewerRole.sql', 'jekabskarklins', 'Add sample safety reviewer role', '2020-07-24') THEN
    BEGIN
        ALTER TABLE roles ALTER COLUMN short_code TYPE VARCHAR(60);
        ALTER TABLE roles ALTER COLUMN title TYPE VARCHAR(60);
       INSERT INTO roles(short_code, title) VALUES('sample_safety_reviewer', 'Sample safety reviewer');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;