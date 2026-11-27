DO
$$
BEGIN
    IF register_patch(
        '0218_ExperimentsScheduledEventIdNullable.sql',
        'Open Code Review',
        'Allow null scheduled_event_id on experiments (DRAFT experiments created on technique proposal approval have no scheduled event yet)',
        '2026-11-24'
    ) THEN
        ALTER TABLE experiments
        ALTER COLUMN scheduled_event_id DROP NOT NULL;
    END IF;
END;
$$
LANGUAGE plpgsql;
