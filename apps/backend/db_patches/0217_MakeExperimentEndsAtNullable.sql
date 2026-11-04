DO
$$
BEGIN
    IF register_patch(
        '0217_MakeExperimentEndsAtNullable',
        'User Office Software',
        'Make experiments.ends_at nullable so placeholder experiments (e.g. created when a technique proposal is assigned to an instrument) can be stored without an end date until a time slot is scheduled',
        '2026-11-03'
    ) THEN
        ALTER TABLE experiments ALTER COLUMN ends_at DROP NOT NULL;
    END IF;
END;
$$
LANGUAGE plpgsql;
