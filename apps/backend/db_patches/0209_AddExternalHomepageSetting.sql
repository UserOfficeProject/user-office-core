DO
$$
BEGIN
	IF register_patch('AddExternalHomepageSetting.sql', 'ChongJiaChua', 'Adding external facility homepage url to settings', '2026-04-16') THEN
	BEGIN
        INSERT INTO settings (settings_id, settings_value, description) 
        VALUES ('EXTERNAL_AUTH_HOMEPAGE_URL', '', 'External Facility Homepage URL') 
        ON CONFLICT DO NOTHING;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
