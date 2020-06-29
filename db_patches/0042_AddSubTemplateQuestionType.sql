DO
$$
BEGIN
	IF register_patch('AddSubTemplateQuestionType.sql', 'jekabskarklins', 'Adding new question type', '2020-06-11') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('SUBTEMPLATE');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;