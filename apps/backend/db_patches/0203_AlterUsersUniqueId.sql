DO
$$
BEGIN
	IF register_patch('AlterUsersUniqueId.sql', 'Gergely Nyiri', 'Adding column unique_id to users', '2026-01-12') THEN
	BEGIN
		ALTER TABLE users ADD COLUMN unique_id varchar(100) UNIQUE;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
