DO
$$
BEGIN
	IF register_patch('RemoveTimeFromDateAnswers.sql', 'jekabskarklins', 'Removing time from date answers, so exact date lookups can be made', '2021-02-12') THEN

        CREATE OR REPLACE FUNCTION updateDateAnswers() RETURNS SETOF answers AS
        $BODY$
        DECLARE
            r answers%rowtype;
        BEGIN
            FOR r IN
				 select answers.* from answers
				 left join questions
				 ON answers.question_id = questions.question_id
				 where questions.data_type='DATE'
            LOOP
				UPDATE answers 
				SET answer = jsonb_set(answer, '{value}',
					(concat('"',substring(answer->>'value',0,11), 'T00:00:00.000Z','"'))::jsonb
				)
				WHERE answer_id=r.answer_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

        PERFORM updateDateAnswers();

        DROP FUNCTION updateDateAnswers();
		
	END IF;
END;
$$
LANGUAGE plpgsql;