DO
$$
BEGIN
	IF register_patch('SetAuthFeatureFalse.sql', 'jekabskarklins', 'Set STFC auth to disabled', '2021-06-03') THEN
	BEGIN
      UPDATE 
        features
      SET 
        is_enabled = false
      WHERE
        feature_id = 'EXTERNAL_AUTH';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
