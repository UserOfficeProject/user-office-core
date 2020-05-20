DO
$$
BEGIN
	IF register_patch('AlterUserGenderLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-10') THEN
	BEGIN


  
		ALTER TABLE users ALTER COLUMN gender TYPE varchar(30);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
