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

    Update topics set sort_order=sort_order+1;

    INSERT INTO topics(topic_title, is_enabled, sort_order, template_id)
    SELECT 'New proposal', true, 0, template_id FROM templates;

    INSERT INTO templates_has_questions(question_id, template_id, topic_id, sort_order, config)
    SELECT 'proposal_basis', template_id, topic_id, 0, '{"required":false,"small_label":"","tooltip":""}'  from topics WHERE sort_order=0;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;