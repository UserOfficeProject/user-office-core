DO
$$
BEGIN
  IF register_patch('0172_AddOrganisationNameAppSetting', 'Jekabs Karklins', 'Add application setting for organisation name', '2025-03-27') THEN
    BEGIN
      INSERT INTO 
			  settings(settings_id, description)
		  VALUES
			  ('ORGANISATION_NAME', 'Organisation name');
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
