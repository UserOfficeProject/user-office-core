DO
$$
BEGIN
    IF register_patch(
        '0217_AddEditInstrumentAvailabilityTimeFeature.sql',
        'Bhaswati Dey',
        'Add feature for FAP secretaries to edit instrument availability time',
        '2026-11-05'
    ) THEN
        INSERT INTO features(feature_id, is_enabled, description)
        VALUES (
            'EDIT_INSTRUMENT_AVAILABILITY_TIME',
            false,
            'A feature when enabled will allow FAP secretaries to edit instrument availability time.'
        );
    END IF;
END;
$$
LANGUAGE plpgsql;
