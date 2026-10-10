DO
$$
BEGIN
  IF register_patch('0215_AddAbstractLengthSettings', 'Zachary Hankin', 'Adds a setting to configure the abstract length', '2026-09-29') THEN
    BEGIN
      INSERT INTO 
			  settings(settings_id, settings_value,  description)
		  VALUES
			  ('MAX_ABSTRACT_LEN', 1500, 'The maximum length of abstract');
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
