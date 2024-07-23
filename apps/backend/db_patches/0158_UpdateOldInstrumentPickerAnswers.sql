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
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
