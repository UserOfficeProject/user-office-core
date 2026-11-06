DO
$$
BEGIN
  IF register_patch(
      '0217_AllowNullExperimentBookingFields.sql',
      'User Office',
      'Allow ends_at and scheduled_event_id to be null in the experiments table. Experiments can now be created as DRAFT placeholders (e.g. when a proposal is assigned to an instrument requiring a technical review) before any booking time slot is scheduled.',
      '2026-11-06'
  ) THEN
    BEGIN
      ALTER TABLE experiments ALTER COLUMN ends_at DROP NOT NULL;
      ALTER TABLE experiments ALTER COLUMN scheduled_event_id DROP NOT NULL;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
