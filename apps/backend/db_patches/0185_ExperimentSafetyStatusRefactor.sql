-- Patch to add a foreign key from experiment_safety.status_id to statuses.status_id
-- Author: Yoganandan Pandiyan
-- Description: Adds a foreign key constraint so experiment_safety.status_id references statuses.status_id. No data migration performed.
-- Date: 2025-04-30
DO $$
BEGIN
  IF register_patch('0185_ExperimentSafetyStatusRefactor', 'Yoganandan Pandiyan', 'experiment_safety.status_id now references statuses.status_id', '2025-04-30') THEN
    ALTER TABLE experiment_safety
      ADD CONSTRAINT experiment_safety_status_id_fkey FOREIGN KEY (status_id) REFERENCES statuses(status_id);
  END IF;
END;
$$ LANGUAGE plpgsql;
