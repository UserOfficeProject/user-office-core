DO
$$
BEGIN
	IF register_patch('AddInternalConfigToQuestions.sql', 'TCMeldrum', 'Add the internal flag to questions config', '2025-06-11') THEN
	BEGIN
		update questions set default_config = jsonb_set(default_config, '{readPermissions}', '[]', true);

		update templates_has_questions set config = jsonb_set(config, '{readPermissions}', '[]', true);

		drop table questions_has_template;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;