DO
$$
BEGIN
	IF register_patch('AddGenericTemplate.sql', 'vyshnavidoddi', 'Adding Generic template feature', '2021-09-21') THEN
	BEGIN

    INSERT INTO template_categories(template_category_id, name) VALUES(7, 'Generic template');

    INSERT INTO question_datatypes(question_datatype_id) VALUES('GENERIC_TEMPLATE');

    INSERT INTO question_datatypes(question_datatype_id) VALUES('GENERIC_TEMPLATE_BASIS');

    CREATE TABLE generic_templates (
            generic_template_id serial PRIMARY KEY
          , title VARCHAR(500) NOT NULL DEFAULT ''
          , proposal_pk int REFERENCES proposals(proposal_pk) ON DELETE CASCADE
          , questionary_id int REFERENCES questionaries(questionary_id) ON DELETE CASCADE
          , creator_id int REFERENCES users (user_id)
          , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          , question_id VARCHAR(64) REFERENCES questions (question_id) ON DELETE CASCADE
      ); 

      INSERT INTO questions(
            question_id,
            data_type,
            question,
            default_config,
            natural_key,
            category_id
        )
    VALUES(
            'generic_template_basis',
            'GENERIC_TEMPLATE_BASIS',
            'Template basic information',
            '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":"","questionLabel":""}',
            'generic_template_basis',
            7
        );

    INSERT INTO template_groups (template_group_id, category_id)
        VALUES
            ('GENERIC_TEMPLATE', 7);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;