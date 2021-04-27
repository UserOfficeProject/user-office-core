DO
$$
BEGIN
	IF register_patch('SetAuthFeature.sql', 'Will Edwards', 'Set STFC auth to enabled', '2021-02-23') THEN
	BEGIN
      INSERT INTO 
        features(feature_id, is_enabled, description)
      VALUES
        ('EXTERNAL_AUTH', true, 'STFC Authentication');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;