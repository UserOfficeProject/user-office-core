DO
$DO$
BEGIN
  IF register_patch('MigrateAnswersNumberInput.sql', 'Jekabs Karklins', 'Converting questions and answers and templates to use new unit format', '2022-01-05') THEN
  BEGIN

    ALTER table questions 
    ALTER COLUMN default_config DROP DEFAULT,
    ALTER COLUMN default_config type jsonb using to_jsonb(default_config::jsonb),
    ALTER COLUMN default_config SET DEFAULT NULL;

    ALTER table templates_has_questions 
    ALTER COLUMN config DROP DEFAULT,
    ALTER COLUMN config type jsonb using to_jsonb(config::jsonb),
    ALTER COLUMN config SET DEFAULT NULL;

    UPDATE questions default_config SET default_config=default_config - 'property';
    UPDATE templates_has_questions config SET config=config - 'property';

-- ANSWERS.NUMBER_INPUT.VALUE
   CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF answers AS
        $BODY$
        DECLARE
            r answers%rowtype;
        BEGIN
            FOR r IN
				 select answers.* from answers
				 where question_id IN (
					 select question_id 
					 from questions
					 where data_type = 'NUMBER_INPUT') 
            LOOP
				UPDATE answers 
				SET answer= (CASE
						WHEN answer->'value'->>'unit' IS NOT NULL
						THEN jsonb_set(answer, '{value,unit}', (
							'{
							"id":"' || (r.answer->'value'->>'unit' )  || '", 
							"unit":"' || (r.answer->'value'->>'unit' )  || '", 
							"quantity":"' || (r.answer->'value'->>'unit' )  || '", 
							"symbol":"' || (r.answer->'value'->>'unit' )  || '", 
							"siConversionFormula":"x"
							}')::jsonb) -- use old string unit value for id, unit, quantity and symbol
                        ELSE
							 jsonb_set(answer, '{value,unit}', (answer->'value'->'unit'))
					END)
				WHERE answer_id=r.answer_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

        PERFORM update_units();

       DROP FUNCTION update_units();


-- ANSWERS.NUMBER_INPUT.SIVALUE
    CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF answers AS
    $BODY$
    DECLARE
        r answers%rowtype;
    BEGIN
        FOR r IN
                select answers.* from answers
                where question_id IN (
                    select question_id 
                    from questions
                    where data_type = 'NUMBER_INPUT') 
        LOOP
            UPDATE answers 
            SET answer= (CASE
                    WHEN answer->'value'->>'unit' IS NOT NULL
                    THEN jsonb_set(answer, '{value,siValue}', (answer->'value'->'value')) -- use value for siValue
                    ELSE jsonb_set(answer, '{value,unit}', (answer->'value'->'unit'))
                END)
            WHERE answer_id=r.answer_id;
            RETURN NEXT r; -- return current row of SELECT
        END LOOP;
        RETURN;
    END;
    $BODY$
    LANGUAGE plpgsql;

    PERFORM update_units();

    DROP FUNCTION update_units();

-- ANSWERS.INTERVAL.UNIT
   CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF answers AS
        $BODY$
        DECLARE
            r answers%rowtype;
        BEGIN
            FOR r IN
				 select answers.* from answers
				 where question_id IN (
					 select question_id 
					 from questions
					 where data_type = 'INTERVAL') 
            LOOP
				UPDATE answers 
				SET answer= (CASE
						WHEN answer->'value'->>'unit' IS NOT NULL
						THEN jsonb_set(answer, '{value,unit}', (
							'{
							"id":"' || (r.answer->'value'->>'unit' )  || '", 
							"unit":"' || (r.answer->'value'->>'unit' )  || '", 
							"quantity":"' || (r.answer->'value'->>'unit' )  || '", 
							"symbol":"' || (r.answer->'value'->>'unit' )  || '", 
							"siConversionFormula":"x"
							}')::jsonb) -- use old string unit value for id, unit, quantity and symbol
					END)
				WHERE answer_id=r.answer_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

       PERFORM update_units();

       DROP FUNCTION update_units();


-- ANSWERS.INTERVAL.SIMIN
    CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF answers AS
    $BODY$
    DECLARE
        r answers%rowtype;
    BEGIN
        FOR r IN
                select answers.* from answers
                where question_id IN (
                    select question_id 
                    from questions
                    where data_type = 'INTERVAL') 
        LOOP
            UPDATE answers 
            SET answer= (CASE
                    WHEN answer->'value'->>'unit' IS NOT NULL
                    THEN jsonb_set(answer, '{value,siMin}', (answer->'value'->'min')) -- use min for siMin
                    ELSE jsonb_set(answer, '{value,unit}', (answer->'value'->'unit'))
                END)
            WHERE answer_id=r.answer_id;
            RETURN NEXT r; -- return current row of SELECT
        END LOOP;
        RETURN;
    END;
    $BODY$
    LANGUAGE plpgsql;

    PERFORM update_units();

    DROP FUNCTION update_units();


-- ANSWERS.INTERVAL.SIMAX
    CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF answers AS
    $BODY$
    DECLARE
        r answers%rowtype;
    BEGIN
        FOR r IN
                select answers.* from answers
                where question_id IN (
                    select question_id 
                    from questions
                    where data_type = 'INTERVAL') 
        LOOP
            UPDATE answers 
            SET answer= (CASE
                    WHEN answer->'value'->>'unit' IS NOT NULL
                    THEN jsonb_set(answer, '{value,siMax}', (answer->'value'->'max')) -- use max for siMax
                    ELSE jsonb_set(answer, '{value,unit}', (answer->'value'->'unit'))
                END)
            WHERE answer_id=r.answer_id;
            RETURN NEXT r; -- return current row of SELECT
        END LOOP;
        RETURN;
    END;
    $BODY$
    LANGUAGE plpgsql;

    PERFORM update_units();

    DROP FUNCTION update_units();



-- QUESTIONS.DEFAULT_CONFIG
   CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF questions AS
        $BODY$
        DECLARE
            r questions%rowtype;
        BEGIN
            FOR r IN
				 select questions.* from questions
				 where question_id IN (
					 select question_id 
					 from questions
					 where data_type IN ('NUMBER_INPUT', 'INTERVAL')) 
            LOOP
				UPDATE questions 
				SET default_config = (CASE
						WHEN jsonb_array_length(default_config->'units') > 0
						THEN jsonb_set(default_config, '{units}', (
							SELECT json_agg(new_unit_arr) FROM
								(SELECT ('{
										"id":' || (unit_string)  || ', 
										"unit":' || (unit_string)  || ', 
										"quantity":' || (unit_string)  || ', 
										"symbol":' || (unit_string)  || ', 
										"siConversionFormula": "x"
										}')::jsonb as new_unit_arr FROM
								(SELECT jsonb_array_elements(default_config->'units')::varchar(1024) as unit_string
								FROM questions WHERE question_id=r.question_id) units_string) new_units)::jsonb)
						ELSE  jsonb_set(default_config, '{units}', (default_config->'units'))
						END)
				WHERE question_id=r.question_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

        PERFORM update_units();

       DROP FUNCTION update_units();



-- TEMPLATES_HAS_QUESTIONS.CONFIG
   CREATE OR REPLACE FUNCTION update_units() RETURNS SETOF templates_has_questions AS
        $BODY$
        DECLARE
            r templates_has_questions%rowtype;
        BEGIN
            FOR r IN
        SELECT templates_has_questions.* 
        FROM templates_has_questions
        LEFT JOIN questions
        ON templates_has_questions.question_id = questions.question_id
        WHERE questions.data_type IN ('NUMBER_INPUT', 'INTERVAL')
            LOOP
              UPDATE templates_has_questions 
				SET config = (CASE
						WHEN jsonb_array_length(config->'units') > 0
						THEN jsonb_set(config, '{units}', (
							SELECT json_agg(new_unit_arr) FROM
								(SELECT ('{
										"id":' || (unit_string)  || ', 
										"unit":' || (unit_string)  || ', 
										"quantity":' || (unit_string)  || ', 
										"symbol":' || (unit_string)  || ', 
										"siConversionFormula": "x"
										}')::jsonb as new_unit_arr FROM
									(SELECT jsonb_array_elements(config->'units')::varchar(1024) as unit_string
									 FROM templates_has_questions 
									 WHERE question_id=r.question_id
									 AND template_id=r.template_id) 
								units_string) 
							new_units)::jsonb)
						ELSE  jsonb_set(config, '{units}', (config->'units'))
						END)
				WHERE question_id=r.question_id AND template_id=r.template_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

        PERFORM update_units();

        DROP FUNCTION update_units();
  END;
  END IF;
END;
$DO$
LANGUAGE plpgsql;
