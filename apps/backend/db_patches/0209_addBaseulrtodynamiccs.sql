DO
$$
BEGIN
    IF register_patch('addBaseulrtodynamiccs.sql', 'Zachary Hankin', 'Adds an option to the dynamic HTTP question type allowing use of base domain', '2026-5-21') THEN
        UPDATE questions
        SET default_config = jsonb_set(
            default_config::jsonb,
            '{useBaseDomain}',
            'false'::jsonb,
            true
        )
        WHERE data_type = 'DYNAMIC_MULTIPLE_CHOICE';
    END IF;
END;
$$
LANGUAGE plpgsql;
