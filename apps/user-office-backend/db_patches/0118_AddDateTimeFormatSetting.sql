DO
$$
BEGIN
	IF register_patch('AddDateTimeFormatSetting', 'Martin Trajanovski', 'Add date time format setting', '2022-03-14') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('DATE_FORMAT', 'Format used to represent date without times');
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('DATE_TIME_FORMAT', 'Format used to represent date with time without seconds.');
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
