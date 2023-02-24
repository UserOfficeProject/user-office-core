DO
$$
BEGIN
    IF register_patch('AddTimedLogoutWarningfeature.sql', 'Thomas Cottee Meldrum', 'Create STFC idle warning feature', '2023-02-14') THEN

    INSERT INTO features(feature_id, description) VALUES ('STFC_IDLE_TIMER', 'STFC idle warning popup');
    INSERT INTO settings(settings_id, description) VALUES ('IDLE_TIMEOUT', 'Timeout for Idle timer in milliseconds');

    END IF;
END;
$$
LANGUAGE plpgsql;