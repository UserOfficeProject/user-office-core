DO
$$
BEGIN
	IF register_patch('MigrateFileUploadAnswers.sql', 'martintrajanovski', 'Migrate file_upload answers to support new structure with captions', '2021-02-05') THEN
	  BEGIN
      UPDATE answers
      SET answer = '{"value": []}'::jsonb
      WHERE question_id LIKE 'file_upload_%'
      AND (
        (answer::json->'value') is null
        OR jsonb_typeof(answer->'value') <> 'array'
      );

      UPDATE answers
      SET answer = JSONB_SET(answer,'{value}',src.new_json)
      FROM (
        SELECT answer_id, 
          JSONB_AGG(
            (SELECT TO_JSONB(_) FROM (SELECT id) AS _)
          ) new_json
        FROM (
          SELECT answer_id, JSONB_ARRAY_ELEMENTS(answer->'value') AS id
          FROM answers WHERE question_id LIKE 'file_upload_%'
        ) src
        GROUP BY src.answer_id
      ) src
      WHERE answers.answer_id = src.answer_id
      AND answers.answer IS NOT NULL
      AND answers.question_id LIKE 'file_upload_%';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;