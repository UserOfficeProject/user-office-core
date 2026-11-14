DO
$$
BEGIN
    IF register_patch('0217_AddEditInstrumentAvailabilityTimeToFaps.sql','Bhaswati Dey','Add per-FAP setting for FAP secretary instrument availability editing','2026-11-06') THEN
        ALTER TABLE faps
            ADD COLUMN IF NOT EXISTS edit_instrument_availability_time BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END;
$$
LANGUAGE plpgsql;
