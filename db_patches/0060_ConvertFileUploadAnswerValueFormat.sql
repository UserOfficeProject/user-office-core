

DO
$$
BEGIN
	IF register_patch('ConvertFileUploadAnswerValueFormat.sql', 'jekabskarklins', 'Convert file upload answer value format', '2020-09-15') THEN
    BEGIN
        UPDATE 
            answers 
        SET 
            answer = concat('{"value":[', array_to_string(string_to_array((answer->>'value')::TEXT, ',')::bigint[], ', '), ']}')::jsonb 
        WHERE 
            question_id IN (
                SELECT 
                    question_id 
                FROM 
                    questions 
                WHERE 
                    data_type='FILE_UPLOAD'
                );
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;