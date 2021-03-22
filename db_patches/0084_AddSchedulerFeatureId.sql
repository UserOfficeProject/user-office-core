DO
$$
BEGIN
    IF register_patch('AddSchedulerFeatureId.sql', 'Peter Asztalos', 'Add Scheduler FeatureId', '2021-03-08') THEN

    INSERT INTO features(feature_id, is_enabled, description) VALUES ('SCHEDULER', true, 'Scheduler feature');

    END IF;
END;
$$
LANGUAGE plpgsql;