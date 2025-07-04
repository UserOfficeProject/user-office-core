DO
$$
BEGIN
	IF register_patch('AddRemoteUsersFeature.sql', 'Jekabs', 'Add REMOTE_USERS feature toggle', '2025-07-04') THEN
	BEGIN
      INSERT INTO 
        features(feature_id, description)
      VALUES
        ('REMOTE_USERS', 'Remote Users feature');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
