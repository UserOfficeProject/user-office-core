DO
$$
BEGIN
  IF register_patch('0176_DropOldSampleSafetySchema', 'Yoganandan Pandiyan', 'Dropping tables involved in old Sample Safety system', '2025-03-08') THEN
    DROP TABLE IF EXISTS "sample_experiment_safety_inputs";
    DROP TABLE IF EXISTS "experiment_safety_inputs";
    DROP TABLE IF EXISTS "scheduled_events";
  END IF;
END;
$$
LANGUAGE plpgsql;