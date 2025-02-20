DO
$$
BEGIN
  IF register_patch('0170_ExperimentSafetyReviewFeature.sql', 'Yoganandan Pandiyan', 'Experiment Safety Review Feature', '2025-02-20') THEN
    BEGIN
      INSERT INTO features(feature_id, description) VALUES ('EXPERIMENT_SAFETY_REVIEW', 'Safety Review workflow for Experiments');
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
