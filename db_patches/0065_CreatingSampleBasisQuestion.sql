DO
$$
BEGIN
	IF register_patch('CreatingSampleBasisQuestion', 'jekabskarklins', 'Create sample basis special question', '2020-10-05') THEN
    
    BEGIN
    INSERT INTO questions(
            question_id,
            data_type,
            question,
            default_config,
            natural_key,
            category_id
        )
    VALUES(
            'sample_basis',
            'SAMPLE_BASIS',
            'Sample basic information',
            '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}',
            'sample_basis',
            2
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
            'proposal_basis',
            'PROPOSAL_BASIS',
            'Proposal basic information',
            '{"required":false,"small_label":"","tooltip":""}',
            'proposal_basis',
            1
        );

    UPDATE topics
    SET sort_order = sort_order + 1
    WHERE template_id IN
        (SELECT template_id
        FROM templates
        WHERE category_id = 1 ); /* Make space for new topic at position 0 */


    INSERT INTO topics(topic_title, is_enabled, sort_order, template_id)
    SELECT 'New proposal',
        TRUE,
        0,
        template_id
    FROM templates
    WHERE category_id = 1; /* Insert new topic for every proposal template at position 0 */
 

    INSERT INTO templates_has_questions(question_id, template_id, topic_id, sort_order, config)
    SELECT 'proposal_basis',
        template_id,
        topic_id,
        0,
        '{"required":false,"small_label":"","tooltip":""}'
    FROM topics
    WHERE sort_order = 0
    AND template_id IN
        (SELECT template_id
        FROM templates
        WHERE category_id = 1 ); /* Add one question with ID proposal_basis to newly created topic */
    END;
	END IF;
END;
$$ LANGUAGE plpgsql;