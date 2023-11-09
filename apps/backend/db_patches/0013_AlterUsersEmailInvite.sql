DO
$$
BEGIN
	IF register_patch('AlterUsersEmailInvite.sql', 'fredrikbolmsten', 'Adding column for accounts created by invite', '2019-11-28') THEN
	BEGIN



		ALTER TABLE users ADD COLUMN placeholder BOOLEAN DEFAULT FALSE;

		UPDATE users SET placeholder = true WHERE email = 'unverified-user@example.com';


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
