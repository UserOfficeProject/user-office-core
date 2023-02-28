DO
$$
BEGIN
    IF register_patch('AddEndSessionUrl.sql', 'Jekabs Karklins', 'Add setting for end session endpoint', '2022-07-07') THEN

    INSERT INTO 
        settings(settings_id, settings_value, description)
      VALUES
        ('EXTERNAL_AUTH_LOGOUT_URL', '', 'URL which terminates the external auth session');
    INSERT INTO 
        settings(settings_id, description) 
      VALUES ('IDLE_TIMEOUT', 'Timeout for Idle timer in milliseconds');

    DELETE FROM features WHERE feature_id = 'EXTERNAL_AUTH';

    INSERT INTO features(feature_id, description) VALUES ('OAUTH', 'Is OAuth enabled');
    
    END IF;
END;
$$
LANGUAGE plpgsql;