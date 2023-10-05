DO
$$
BEGIN
	IF register_patch('0068_ConvertSubtemplateToSampleDeclaration.sql', 'jekabskarklins', 'Convert Subtemplate To Sample Declaration', '2020-10-28') THEN
	BEGIN

    ALTER TABLE questions
	DROP CONSTRAINT "questions_data_type_fkey";

	ALTER TABLE questions 
	ADD CONSTRAINT questions_data_type_fkey 
	FOREIGN KEY (data_type) 
	REFERENCES question_datatypes(question_datatype_id) 
	ON UPDATE CASCADE;

	UPDATE question_datatypes  SET question_datatype_id = 'SAMPLE_DECLARATION' WHERE question_datatype_id='SUBTEMPLATE';

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;