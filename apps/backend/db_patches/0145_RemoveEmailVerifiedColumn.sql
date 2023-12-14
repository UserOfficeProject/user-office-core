DO
$$
BEGIN
	IF register_patch('RemoveEmailVerifiedColumn.sql', 'jekabskarklins', 'Remove column email_verified as it is obsolete and UOS not responsible for user management', '2023-11-17') THEN
	BEGIN

        ALTER TABLE users DROP COLUMN email_verified;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;