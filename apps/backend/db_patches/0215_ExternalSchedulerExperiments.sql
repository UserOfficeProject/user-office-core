DO
$$
BEGIN
  IF register_patch('0215_ExternalSchedulerExperiments', 'User Office', 'Allow external scheduler experiments and store their source', '2026-11-02') THEN
    ALTER TABLE experiments
      ALTER COLUMN scheduled_event_id DROP NOT NULL;

    ALTER TABLE experiments
      ADD COLUMN source TEXT;
  END IF;
END;
$$
LANGUAGE plpgsql;
