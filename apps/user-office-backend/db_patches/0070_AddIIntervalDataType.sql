DO
$$
BEGIN
	IF register_patch('AddIntervalDataType.sql', 'jekabskarklins', 'Adding new question type', '2020-10-30') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('INTERVAL');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;