DO
$$
BEGIN
    IF register_patch('addMultiInstrumentJustification.sql', 'Zachary Hankin', 'Adds the option to request justification for multiple instrument use from the user', '2026-6-15') THEN
        UPDATE questions
        SET default_config = jsonb_set(
            default_config::jsonb,
            '{multiJustificationRequired}',
            'false'::jsonb,
            true
        )
        WHERE data_type = 'INSTRUMENT_PICKER';
    END IF;
END;
$$
LANGUAGE plpgsql;
