DO
$$
DECLARE
    technical_review_template_id_var int;
    technical_review_topic_id_var int;
    questionary_id_var int;
    technical_review_loop_var proposals%rowType;
BEGIN
    IF register_patch('0165_AddTechnicalReviewTemplate.sql', 'Gergely Nyiri', 'Add Technical review template', '2024-10-15') THEN

    INSERT INTO template_categories(template_category_id, name) VALUES(11, 'Technical Review');
	
    INSERT INTO template_groups (template_group_id, category_id) VALUES('TECHNICAL_REVIEW_TEMPLATE', 11);
	
    INSERT INTO question_datatypes(question_datatype_id) VALUES('TECHNICAL_REVIEW_BASIS');

    INSERT INTO questions(
                question_id,
                data_type,
                question,
                default_config,
                natural_key,
                category_id
            )
        VALUES(
                'technical_review_basis'
                , 'TECHNICAL_REVIEW_BASIS'
                , 'Technical review basic information'
                , '{"required":false,"small_label":"","tooltip":""}'
                , 'technical_review_basis'
                , 11
            );

    ALTER TABLE technical_review ADD COLUMN questionary_id INTEGER REFERENCES questionaries (questionary_id);

    ALTER TABLE call ADD COLUMN technical_review_template_id INTEGER REFERENCES templates(template_id);

    INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('default technical review template', 'default technical review template', false, 'TECHNICAL_REVIEW_TEMPLATE');

    SELECT templates.template_id 
      INTO technical_review_template_id_var
      FROM templates 
      WHERE name='default technical review template';

    INSERT INTO topics(topic_title, is_enabled, sort_order, template_id) VALUES('New technical review', TRUE, 0, technical_review_template_id_var);

    SELECT topics.topic_id
    INTO technical_review_topic_id_var
    FROM topics
    WHERE topic_title='New technical review';

    INSERT INTO templates_has_questions (question_id, template_id, topic_id, sort_order, config) VALUES('technical_review_basis', technical_review_template_id_var, technical_review_topic_id_var, 0, '{"required":false,"small_label":"","tooltip":""}');

    UPDATE call set technical_review_template_id = technical_review_template_id_var;

    CREATE OR REPLACE FUNCTION CreateTechnicalReviewQuestionary(p_template_id int)
	RETURNS integer AS $func$
	DECLARE
		q_id integer;
	BEGIN
	    INSERT INTO questionaries(template_id) VALUES(p_template_id) RETURNING questionary_id INTO q_id;
	    RETURN q_id;
	END;
	$func$ LANGUAGE plpgsql;

    FOR technical_review_loop_var IN
        SELECT * FROM technical_review
    LOOP
        UPDATE technical_review SET questionary_id = CreateTechnicalReviewQuestionary(technical_review_template_id_var) WHERE technical_review_id = technical_review_loop_var.technical_review_id;
    END LOOP;

    END IF;
END;
$$
LANGUAGE plpgsql;
