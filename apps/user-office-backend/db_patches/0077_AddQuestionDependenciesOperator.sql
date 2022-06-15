DO
$$
BEGIN
	IF register_patch('AddDependenciesOperator.sql', 'martintrajanovski', 'Question dependencies logic operator.', '2021-01-12') THEN
	  BEGIN
			ALTER TABLE templates_has_questions ADD COLUMN dependencies_operator VARCHAR(64) DEFAULT 'AND';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;