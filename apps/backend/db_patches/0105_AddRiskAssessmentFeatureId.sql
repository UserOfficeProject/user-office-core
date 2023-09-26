DO
$$
BEGIN
    IF register_patch('AddRiskAssessmentFeatureId.sql', 'Jekabs Karklins', 'Add Risk Assessment FeatureId', '2021-09-07') THEN

    INSERT INTO features(feature_id, description) VALUES ('RISK_ASSESSMENT', 'Risk assessment functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;