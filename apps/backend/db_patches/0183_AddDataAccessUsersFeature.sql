DO
$$
BEGIN
	IF register_patch('AddDataAccessUsersFeature.sql', 'jekabskarklins', 'Add DATA_ACCESS_USERS feature toggle', '2025-07-04') THEN
	BEGIN
      INSERT INTO 
        features(feature_id, description)
      VALUES
        ('DATA_ACCESS_USERS', 'Data Access Users feature. Enables the management of users who can access data of proposal without being otherwise associated with a specific proposal or experiment.');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
