DO
$$
BEGIN
    IF register_patch(
        '0217_AlterInstitutions.sql',
        'Balazs Csete',
        'Change type of institution name to varchar(1024)',
        '2026-11-10'
    ) THEN
        ALTER TABLE institutions ALTER COLUMN institution TYPE VARCHAR(1024);
    END IF;
END;
$$
LANGUAGE plpgsql;
