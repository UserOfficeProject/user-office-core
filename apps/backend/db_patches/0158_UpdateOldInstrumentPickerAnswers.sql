DO
$$
BEGIN
  IF register_patch('0158_UpdateOldInstrumentPickerAnswers.sql', 'Bhaswati Dey', 'Update old instrument picker answers', '2024-07-23') THEN
    BEGIN
      --QUERY TO UPDATE ANSWERS WITH SINGLE INSTRUMENT ID
      UPDATE answers 
      SET answer = jsonb_set(answer, '{value}', jsonb_build_object('instrumentId', answer->>'value','timeRequested',null)) 
      WHERE question_id IN (SELECT question_id FROM  questions WHERE data_type='INSTRUMENT_PICKER' AND
      (default_config->'isMultipleSelect' IS NULL OR default_config->>'isMultipleSelect' = 'false'));

      --SQL BLOCK TO UPDATE ANSWERS WITH MULTIPLE INSTRUMENT IDS
      DECLARE rec record;
      BEGIN
	      FOR rec IN 
	        WITH item AS (
	        SELECT ('{value,' || pos - 1 || '}')::text[] AS path, answer->'value'->((pos - 1)::int) AS instrumentId, answer_id FROM answers, 
	        jsonb_array_elements(answer->'value') WITH ordinality arr(item, pos) WHERE question_id IN (
		      SELECT question_id FROM  questions WHERE data_type='INSTRUMENT_PICKER' AND default_config->>'isMultipleSelect' = 'true')
	        )SELECT * FROM item
	
	      LOOP
		      IF jsonb_typeof(rec.instrumentId)='number' THEN
			      UPDATE answers a
			      SET answer = jsonb_set(answer, rec.path, jsonb_build_object('instrumentId',rec.instrumentId::text,'timeRequested',null)) 
			      WHERE a.answer_id = rec.answer_id;
		      END IF;
	      END LOOP;
      END;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
