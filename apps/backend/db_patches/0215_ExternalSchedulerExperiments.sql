DO
$$
BEGIN
  IF register_patch('0215_ExternalSchedulerExperiments', 'Grant James', 'Allow external scheduler experiments and store their source', '2026-11-02') THEN
    ALTER TABLE experiments
      ADD COLUMN source VARCHAR(20);

    CREATE UNIQUE INDEX experiments_uos_scheduled_event_id_unique
      ON experiments (scheduled_event_id)
      WHERE source IS NULL;

    CREATE UNIQUE INDEX experiments_source_scheduled_event_id_unique
      ON experiments (source, scheduled_event_id)
      WHERE source IS NOT NULL;
  END IF;
END;
$$
LANGUAGE plpgsql;
