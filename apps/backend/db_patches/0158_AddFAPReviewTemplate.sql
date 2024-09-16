DO
$$
DECLARE
    fap_review_template_id_var int;
    fap_review_topic_id_var int;
    questionary_id_var int;
BEGIN
    IF register_patch('AddFAPReviewTemplate.sql', 'Gergely Nyiri', 'Add FAP review template', '2024-06-11') THEN

    INSERT INTO template_categories(template_category_id, name) VALUES(10, 'FAP Review');
	
    INSERT INTO template_groups (template_group_id, category_id) VALUES('FAP_REVIEW_TEMPLATE', 10);
	
    INSERT INTO question_datatypes(question_datatype_id) VALUES('FAP_REVIEW_BASIS');

    INSERT INTO questions(
                question_id,
                data_type,
                question,
                default_config,
                natural_key,
                category_id
            )
        VALUES(
                'fap_review_basis'
                , 'FAP_REVIEW_BASIS'
                , 'FAP review basic information'
                , '{"required":false,"small_label":"","tooltip":""}'
                , 'fap_review_basis'
                , 10
            );

    ALTER TABLE fap_reviews ADD COLUMN questionary_id INTEGER REFERENCES questionaries (questionary_id);

    ALTER TABLE call ADD COLUMN fap_review_template_id INTEGER REFERENCES templates(template_id);

    INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('default fap review template', 'default fap review template', false, 'FAP_REVIEW_TEMPLATE');

    SELECT templates.template_id 
      INTO fap_review_template_id_var
      FROM templates 
      WHERE name='default fap review template';

    INSERT INTO questionaries(template_id, created_at, creator_id) VALUES (fap_review_template_id_var, NOW(), 0);

    INSERT INTO topics(topic_title, is_enabled, sort_order, template_id) VALUES('New fap review', TRUE, 0, fap_review_template_id_var);

    SELECT topics.topic_id
    INTO fap_review_topic_id_var
    FROM topics
    WHERE topic_title='New fap review';

    INSERT INTO templates_has_questions (question_id, template_id, topic_id, sort_order, config) VALUES('fap_review_basis', fap_review_template_id_var, fap_review_topic_id_var, 0, '{"required":false,"small_label":"","tooltip":""}');

    SELECT questionaries.questionary_id
    INTO questionary_id_var
    FROM questionaries
    WHERE template_id = fap_review_template_id_var;

    UPDATE fap_reviews SET questionary_id = questionary_id_var;

    UPDATE call set fap_review_template_id = fap_review_template_id_var;

    END IF;
END;
$$
LANGUAGE plpgsql;
