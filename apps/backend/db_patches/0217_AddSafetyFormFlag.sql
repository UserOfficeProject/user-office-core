DO
$$
BEGIN
    IF register_patch('0217_AddSafetyFormFlag.sql', 'Zachary Hankin', 'Adds a feature flag for UOC handling safety forms', '2026-10-15') THEN

    INSERT INTO features(feature_id, description) VALUES ('SAFETY_FORM', 'If UOC handles users safety forms');

    END IF;
END;
$$
LANGUAGE plpgsql;