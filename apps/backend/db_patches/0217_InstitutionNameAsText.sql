DO
$$
BEGIN
    IF register_patch(
        '0217_InstitutionNameAsText.sql',
        'Balazs Csete',
        'Change type of institution name to text',
        '2026-11-10'
    ) THEN
        ALTER TABLE institutions ALTER COLUMN institution TYPE text;
    END IF;
END;
$$
LANGUAGE plpgsql;
