DO
$$
BEGIN
	IF register_patch('0218_AddNotesToExperiment.sql', 'Zachary Hankin', 'Add new notes field for experiments', '2026-11-12') THEN
	BEGIN

        ALTER TABLE experiments DROP COLUMN IF EXISTS notes;

        ALTER TABLE experiments ADD COLUMN notes VARCHAR(10000);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;