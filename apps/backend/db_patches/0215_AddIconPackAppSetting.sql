DO
$$
BEGIN
    IF register_patch('AddIconPackAppSetting.sql', 'Balazs Csete', 'Adds new app setting to select icon pack', '2026-10-12') THEN

    INSERT INTO settings(settings_id, description) VALUES ('ICON_PACK', 'Icon pack to use');

    END IF;
END;
$$
LANGUAGE plpgsql;