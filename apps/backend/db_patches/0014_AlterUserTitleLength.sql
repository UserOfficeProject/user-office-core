DO
$$
BEGIN
	IF register_patch('AlterUserTitleLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-10') THEN
	BEGIN



		ALTER TABLE users ALTER COLUMN user_title TYPE varchar(15);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
