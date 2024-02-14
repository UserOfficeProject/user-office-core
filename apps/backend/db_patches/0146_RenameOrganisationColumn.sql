DO
$$
BEGIN
	IF register_patch('RenameOrganisationColumn.sql', 'jekabskarklins', 'Rename column organisation to institution for readability and maintainability', '2023-11-17') THEN
	BEGIN

        ALTER TABLE users RENAME COLUMN organisation TO institution_id;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;