DO
$$
BEGIN
	IF register_patch('AlterUsers.sql', 'fredrikbolmsten', 'Make user fields longer', '2019-11-14') THEN
	BEGIN



  
		ALTER TABLE users ALTER COLUMN middlename TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN firstname TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN lastname TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN username TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN preferredname TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN nationality TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN organisation TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN department TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN position TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN email TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN telephone TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN telephone_alt TYPE varchar(100);
		ALTER TABLE users ALTER COLUMN orcid TYPE varchar(100);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
