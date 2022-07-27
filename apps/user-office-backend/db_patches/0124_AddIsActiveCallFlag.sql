DO
$$
BEGIN
    IF register_patch('AddIsActiveCallFlag.sql', 'Martin Trajanovski', 'Add is_active flag to the calls table', '2022-06-21') THEN

        ALTER TABLE "call"
        ADD COLUMN is_active boolean DEFAULT true;

    END IF;
END;
$$
LANGUAGE plpgsql;