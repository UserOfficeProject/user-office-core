DO
$$
BEGIN
    IF register_patch('AddSchedulerFeatureId.sql', 'Peter Asztalos', 'Add Scheduler FeatureId', '2021-03-08') THEN

    INSERT INTO features(feature_id, description) VALUES ('SCHEDULER', 'Scheduler feature');

    END IF;
END;
$$
LANGUAGE plpgsql;