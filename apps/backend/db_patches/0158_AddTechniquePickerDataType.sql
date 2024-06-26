DO
$$
BEGIN
	IF register_patch('AddTechniquePickerDataType.sql', 'Simon Fernandes, Deepak Jaison', 'Adding Technique Picker type', '2024-06-26') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('TECHNIQUE_PICKER');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
