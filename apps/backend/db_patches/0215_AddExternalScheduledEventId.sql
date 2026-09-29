DO
$$
BEGIN
  IF register_patch(
    '0215_AddExternalScheduledEventId',
    'User Office Software',
    'Add external scheduled event identifier and source system to experiments',
    '2026-09-29'
  ) THEN
    BEGIN
      ALTER TABLE experiments
        ADD COLUMN IF NOT EXISTS external_scheduled_event_id TEXT DEFAULT NULL;

      ALTER TABLE experiments
        ADD COLUMN IF NOT EXISTS external_scheduled_event_source_system TEXT DEFAULT NULL;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
