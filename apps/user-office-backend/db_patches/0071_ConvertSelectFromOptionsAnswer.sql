DO
$$
BEGIN
	IF register_patch('ConvertSelectFromOptionsAnswer.sql', 'jekabskarklins', 'Convert SelectFromOptions answer to array', '2020-11-13') THEN
        CREATE OR REPLACE FUNCTION update_answers() RETURNS SETOF answers AS
        $BODY$
        DECLARE
            r answers%rowtype;
        BEGIN
            FOR r IN
				select answers.* from answers
				 left join questions
				 ON answers.question_id = questions.question_id
				 where questions.data_type='SELECTION_FROM_OPTIONS'
            LOOP
                UPDATE answers 
				SET answer = jsonb_set(answer, '{value}', jsonb_build_array(r.answer->'value'))
				WHERE answer_id=r.answer_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

        PERFORM update_answers();
	END IF;
END;
$$
LANGUAGE plpgsql;