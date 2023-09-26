DO
$$
BEGIN
	IF register_patch('AddExternalCommentTechRev.sql', 'fredrikbolmsten', 'Logging', '2020-04-01') THEN
	BEGIN

    ALTER TABLE technical_review ADD COLUMN public_comment text;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;