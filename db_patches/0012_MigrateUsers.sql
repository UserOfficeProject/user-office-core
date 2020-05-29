DO
$$
BEGIN
	IF register_patch('MigrateUsers.sql', 'fredrikbolmsten', 'Setting nationality and organisation for users', '2019-11-26') THEN
	BEGIN

  
		update users set nationality=1;
		update users set organisation=1;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
