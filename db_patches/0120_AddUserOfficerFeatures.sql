DO
$$
BEGIN
    IF register_patch('AddUserOfficerFeatures.sql', 'Russell McLean', 'Add User Officer Features', '2022-04-26') THEN

    INSERT INTO features(feature_id, description) VALUES ('SEP_REVIEW', 'SEP functionality');

    INSERT INTO features(feature_id, description) VALUES ('USER_MANAGEMENT', 'User management functionality');

    INSERT INTO features(feature_id, description) VALUES ('VISIT_MANAGEMENT', 'Visit management functionality');

    INSERT INTO features(feature_id, description) VALUES ('SAMPLE_SAFETY', 'Sample safety functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;