DO
$$
BEGIN
	IF register_patch('AddProfileUrlSetting.sql', 'Simon Fernandes', 'Add profile URL setting', '2021-07-09') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES(
			'PROFILE_PAGE_LINK',
			'P&O user profile page link'
		  );
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;