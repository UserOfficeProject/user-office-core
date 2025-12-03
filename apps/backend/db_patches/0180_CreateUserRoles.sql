DO
$$
BEGIN
	IF register_patch('0180_Create_user_roles.sql', 'Fredrik Bolmsten', 'Create dynamic user roles', '2025-05-06') THEN
	BEGIN

    ALTER TABLE roles
    ADD COLUMN permissions TEXT[] NOT NULL DEFAULT '{}';

    ALTER TABLE roles
    ADD COLUMN data_access TEXT[] NOT NULL DEFAULT '{}';
    
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
