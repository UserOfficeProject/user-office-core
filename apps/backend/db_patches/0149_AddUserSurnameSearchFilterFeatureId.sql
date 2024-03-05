DO
$$
BEGIN
    IF register_patch('AddUserSurnameSearchFilterFeatureId', 'Junjie Quan', 'Add User Surname Search filter FeatureId', '2024-03-05') THEN

    INSERT INTO features(feature_id, description) VALUES ('USER_SURNAME_SEARCH_FILTER', 'Filter users list by surname functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;