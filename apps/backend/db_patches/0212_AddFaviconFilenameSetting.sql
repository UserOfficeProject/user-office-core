DO
$$
BEGIN
	IF register_patch('AddFaviconFilenameSetting.sql', 'yoganandaness', 'Add favicon filename to settings', '2026-06-01') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('FAVICON_FILENAME', 'The filename of the favicon image to use. E.g. ess-favicon.ico');
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
