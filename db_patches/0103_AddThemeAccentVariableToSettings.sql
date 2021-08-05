DO
$$
BEGIN
	IF register_patch('AddThemeAccentVariableToSettings.sql', 'Martin Trajanovski', 'Add theme variables to settings', '2021-08-02') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('PALETTE_PRIMARY_ACCENT', 'Hex value for primary main colour');
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
