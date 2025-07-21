DO
$$
DECLARE
    exp_safety_review_template_id_var int;
    exp_safety_review_topic_id_var int;
    questionary_id_var int;
BEGIN
    IF register_patch('AddExperimentSafetyReviewTemplate.sql', 'Yoganandan Pandiyan', 'Add Experiment Safety review template', '2025-07-28') THEN

        -- Increase template_group_id column size to 50
        ALTER TABLE template_groups ALTER COLUMN template_group_id TYPE VARCHAR(50);
        
        -- Also update the foreign key columns to match
        ALTER TABLE templates ALTER COLUMN group_id TYPE VARCHAR(50);
        ALTER TABLE active_templates ALTER COLUMN group_id TYPE VARCHAR(50);

        INSERT INTO template_categories(template_category_id, name) VALUES(12, 'Experiment Safety Review');
        
        INSERT INTO template_groups (template_group_id, category_id) VALUES('EXPERIMENT_SAFETY_REVIEW_TEMPLATE', 12);
        
        INSERT INTO question_datatypes(question_datatype_id) VALUES('EXPERIMENT_SAFETY_REVIEW_BASIS');

        INSERT INTO questions(
                    question_id,
                    data_type,
                    question,
                    default_config,
                    natural_key,
                    category_id
                )
            VALUES(
                    'exp_safety_review_basis'
                    , 'EXPERIMENT_SAFETY_REVIEW_BASIS'
                    , 'Experiment Safety review basic information'
                    , '{"required":false,"small_label":"","tooltip":""}'
                    , 'exp_safety_review_basis'
                    , 12
                );

        INSERT INTO templates(name, description, is_archived, group_id) VALUES 
        ('default experiment safety review template', 'default experiment safety review template', false, 'EXPERIMENT_SAFETY_REVIEW_TEMPLATE');

        SELECT templates.template_id 
        INTO exp_safety_review_template_id_var
        FROM templates 
        WHERE name='default experiment safety review template';

        INSERT INTO topics(topic_title, is_enabled, sort_order, template_id) VALUES('New experiment safety review', TRUE, 0, exp_safety_review_template_id_var);

        SELECT topics.topic_id
        INTO exp_safety_review_topic_id_var
        FROM topics
        WHERE topic_title='New experiment safety review';

        INSERT INTO templates_has_questions (question_id, template_id, topic_id, sort_order, config) VALUES('exp_safety_review_basis', exp_safety_review_template_id_var, exp_safety_review_topic_id_var, 0, '{"required":false,"small_label":"","tooltip":""}');

    END IF;
END;
$$
LANGUAGE plpgsql;
