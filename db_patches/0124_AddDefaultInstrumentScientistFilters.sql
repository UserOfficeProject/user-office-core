DO
$$
BEGIN
    IF register_patch('AddDefaultInstrumentScientistFilters.sql', 'Vyshnavi Doddi', 'Add default instrument scientist filters', '2022-07-13') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('DEFAULT_INST_SCI_STATUS_FILTER', 'Default instrument scientist status filter');
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('DEFAULT_INST_SCI_REVIEWER_FILTER', 'Default instrument scientist reviewer filter');
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;