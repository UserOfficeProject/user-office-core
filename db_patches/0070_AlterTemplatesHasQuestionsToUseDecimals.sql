DO
$$
BEGIN
	IF register_patch('AlterTemplatesHasQuestionsToUseDecimals.sql', 'martintrajanovski', 'Use decimal type for sort order to be able to order easier.', '2020-11-06') THEN
	  BEGIN
			ALTER TABLE templates_has_questions ALTER COLUMN sort_order TYPE DECIMAL(15, 14);

			UPDATE templates_has_questions
			SET sort_order = 0.1
			WHERE sort_order = 0;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;