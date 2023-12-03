DO
$$
BEGIN
	IF register_patch('RemovePwdColumn.sql', 'jekabskarklins', 'Remove password column, as system is using OIDC', '2023-11-22') THEN
		BEGIN
    	ALTER TABLE users 
		DROP COLUMN password;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;