DO
$$
BEGIN
	IF register_patch('AddTimezoneSetting', 'Simon Fernandes', 'Add timezone setting', '2022-02-03') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('TIMEZONE', 'IANA time zone name, used for call start/end times');
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
