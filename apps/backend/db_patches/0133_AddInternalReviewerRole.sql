

DO
$$
BEGIN
	IF register_patch('AddInternalReviewerRole.sql', 'martintrajanovski', 'Add internal reviewer role', '2023-06-26') THEN
    BEGIN
       INSERT INTO roles(short_code, title) VALUES('internal_reviewer', 'Internal reviewer');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
