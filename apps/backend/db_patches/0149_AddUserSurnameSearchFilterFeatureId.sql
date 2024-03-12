DO
$$
BEGIN
    IF register_patch('AddUserSearchFilterFeatureId', 'Junjie Quan', 'Add User Search filter FeatureId', '2024-03-05') THEN

    INSERT INTO features(feature_id, description) VALUES ('USER_SEARCH_FILTER', 'Flag for users list filter functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;