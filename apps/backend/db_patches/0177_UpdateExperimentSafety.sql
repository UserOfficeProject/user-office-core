DO
$$
BEGIN
  IF register_patch('0177_UpdateExperimentSafety', 'Yoganandan Pandiyan', 'Reconstructing Experiment Safety review in accordance with the new requirement', '2025-04-08') THEN
    ALTER TABLE experiment_safety ADD COLUMN IF NOT EXISTS "instrument_scientist_decision" varchar(30);
    ALTER TABLE experiment_safety ADD COLUMN IF NOT EXISTS "instrument_scientist_decision_comment" text;
    ALTER TABLE experiment_safety ADD COLUMN IF NOT EXISTS "experiment_safety_reviewer_decision" varchar(30);
    ALTER TABLE experiment_safety ADD COLUMN IF NOT EXISTS "experiment_safety_reviewer_decision_comment" text;
    ALTER TABLE experiment_safety DROP COLUMN IF EXISTS "status";
    ALTER TABLE experiment_safety ADD COLUMN IF NOT EXISTS "status_id" int;
  END IF;
END;
$$
LANGUAGE plpgsql;