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
            '{"placeholder":"Title","required":false,"small_label":"","tooltip":""}',
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
            2
        );

        

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;