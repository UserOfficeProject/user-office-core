DO
$$
BEGIN
	IF register_patch('AddThemeVariablesToSettings.sql', 'Simon Fernandes', 'Add theme variables to settings', '2021-07-08') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('HEADER_LOGO_FILENAME', 'The filename of the image to use in the header. E.g. stfc-ukri-white.svg'),
			('PALETTE_PRIMARY_DARK', 'Hex value for primary dark colour'),
			('PALETTE_PRIMARY_MAIN', 'Hex value for primary main colour'),
			('PALETTE_PRIMARY_LIGHT', 'Hex value for primary light colour'),
			('PALETTE_SECONDARY_DARK', 'Hex value for secondary dark colour'),
			('PALETTE_SECONDARY_MAIN', 'Hex value for secondary main colour'),
			('PALETTE_SECONDARY_LIGHT', 'Hex value for secondary light colour'),
			('PALETTE_ERROR_MAIN', 'Hex value for error main colour'),
			('PALETTE_INFO_MAIN', 'Hex value for info main colour'),
			('PALETTE_SUCCESS_MAIN', 'Hex value for success main colour'),
			('PALETTE_WARNING_MAIN', 'Hex value for warning main colour'),
			('PALETTE_PRIMARY_CONTRAST', 'Hex value for primary contrast text colour'),
			('PALETTE_SECONDARY_CONTRAST', 'Hex value for secondary contrast text colour');
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
