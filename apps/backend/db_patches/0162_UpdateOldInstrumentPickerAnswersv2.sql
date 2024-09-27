DO
$$
BEGIN
  /*
  Updates all previous instrument picker answers to use the correct format. Some answers were previously missed and so are in the old format, and some use a null timeRequested value. This script adds or changes the timeRequested from null into a string, e.g.
  
  Single select
  {
    "value": {
      "instrumentId": "36",
      "timeRequested": "0"
    }
  }
  
  Multi select
  {
    "value": [
      {
        "instrumentId": "10",
        "timeRequested": "0"
      },
      {
        "instrumentId": "11",
        "timeRequested": "0"
      }
    ]
  } 
  */
  IF register_patch('0162_UpdateOldInstrumentPickerAnswersv2.sql', 'Simon Fernandes', 'Update old instrument picker answers v2', '2024-09-16') THEN

    BEGIN
      /*
      Update single select answers that were previously missed because their value is a string, e.g.
      
      {
        "value": "18"
      }
      */
      UPDATE answers
         SET answer = jsonb_set(answer, '{value}', jsonb_build_object('instrumentId', answer->>'value','timeRequested', '0')) 
       WHERE jsonb_typeof(answer->'value') = 'string'
         AND question_id IN (
               SELECT question_id
                 FROM questions
                WHERE data_type= 'INSTRUMENT_PICKER'
                  AND (default_config->'isMultipleSelect' IS NULL OR default_config->>'isMultipleSelect' = 'false')
             );

       /*
       Update single select answers that use a null timeRequested value, e.g.
       
           {
             "value": {
               "instrumentId": "10",
               "timeRequested": null
             }
           }
       */
       UPDATE answers
          SET answer = jsonb_set(answer, '{value,timeRequested}', '"0"'::jsonb)
        WHERE answer->'value'->>'timeRequested' IS NULL
          AND jsonb_typeof(answer->'value') = 'object'
          AND question_id IN (
                SELECT question_id
                  FROM questions
                 WHERE data_type = 'INSTRUMENT_PICKER'
          );
			 
			 
       /*
       Update multiple select answers that were previously missed because their value is a string, e.g.
	   {
         "value": [
           {
             "instrumentId": "14"
           },
           {
            "instrumentId": "11"
           }
         ]
       }
       */
       DECLARE rec record;
       BEGIN
         FOR rec IN 
           WITH item AS (
             SELECT ('{value,' || (pos - 1)::int || ',timeRequested}')::text[] AS path, 
                    answer->'value'->((pos - 1)::text) AS element, 
                    answer_id
               FROM answers,
                    jsonb_array_elements(answer->'value') WITH ordinality arr(item, pos)
              WHERE jsonb_typeof(answer->'value') = 'array'
                AND answer->'value'->((pos - 1)::int)->>'timeRequested' IS NULL
                AND question_id IN (
                      SELECT question_id 
                        FROM questions 
                       WHERE data_type = 'INSTRUMENT_PICKER'
                    )
         )
         SELECT * FROM item
         LOOP
           IF rec.element->>'timeRequested' IS NULL THEN
             UPDATE answers a
                SET answer = jsonb_set(answer, rec.path, '"0"'::jsonb)
              WHERE a.answer_id = rec.answer_id;
           END IF;
         END LOOP;
       END;

      /*
      Update multiple select answers that use a null timeRequested value, e.g.
      
      {
        "value": [
          {
            "instrumentId": "10",
            "timeRequested": null
          },
          {
            "instrumentId": "11",
            "timeRequested": null
          }
        ]
      }
     */
      DECLARE rec record;
      BEGIN
        FOR rec IN 
          WITH item AS (
            SELECT ('{value,' || (pos - 1)::int || ', timeRequested}')::text[] AS path, 
                   answer->'value'->((pos - 1)::int)->>'timeRequested' AS timeRequested, 
                   answer_id 
              FROM answers,
                   jsonb_array_elements(answer->'value') WITH ordinality arr(item, pos) 
             WHERE jsonb_typeof(answer->'value') = 'array'
         AND question_id IN (
                     SELECT question_id 
                       FROM questions 
                      WHERE data_type = 'INSTRUMENT_PICKER'
                   )
          )
        SELECT * FROM item
        LOOP
          IF rec.timeRequested IS NULL THEN
              UPDATE answers a
              SET answer = jsonb_set(answer, rec.path, '"0"'::jsonb) 
              WHERE a.answer_id = rec.answer_id;
          END IF;
        END LOOP;
      END;

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;