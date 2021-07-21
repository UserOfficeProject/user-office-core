DO
$$
BEGIN
	IF register_patch('AddProfileUrlSetting.sql', 'Simon Fernandes', 'Add profile URL setting', '2021-07-09') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES(
			'PROFILE_PAGE_LINK',
			'Link to external user profile'
		  );
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
