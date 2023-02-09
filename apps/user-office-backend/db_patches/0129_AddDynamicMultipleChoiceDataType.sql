DO
$$
BEGIN
	IF register_patch('AddDynamicMultipleChoiceDataType.sql', 'Junjie Quan', 'Adding dynamic multiple choice type', '2023-02-09') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('DYNAMIC_MULTIPLE_CHOICE');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;