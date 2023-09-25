

DO
$$
BEGIN
	IF register_patch('ConvertDependencyConditionToJsonb.sql', 'jekabskarklins', 'Convert field dependency to JSONB', '2020-08-04') THEN
    BEGIN
        ALTER TABLE templates_has_questions ALTER COLUMN dependency_condition TYPE jsonb USING dependency_condition::jsonb;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;