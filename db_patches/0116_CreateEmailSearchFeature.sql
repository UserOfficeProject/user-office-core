DO
$$
BEGIN
    IF register_patch('CreateEmailSearchFeature.sql', 'Vlad Ionica', 'Create Email Search Feature', '2022-01-28') THEN

    INSERT INTO features(feature_id, description) VALUES ('EMAIL_SEARCH', 'Search by Email functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;