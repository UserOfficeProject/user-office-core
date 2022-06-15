DO
$$
BEGIN
	IF register_patch('AddNumberInputDataType.sql', 'fredrikbolmsten', 'Adding new question type', '2021-01-04') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('NUMBER_INPUT');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;