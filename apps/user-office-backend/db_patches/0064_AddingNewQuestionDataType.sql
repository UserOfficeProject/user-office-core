

DO
$$
BEGIN
	IF register_patch('AddingNewQuestionDataType', 'jekabskarklins', 'Insert SAMPLE_BASIS question data type', '2020-10-01') THEN
    BEGIN
        INSERT INTO question_datatypes(question_datatype_id) VALUES('SAMPLE_BASIS');
        INSERT INTO question_datatypes(question_datatype_id) VALUES('PROPOSAL_BASIS');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;