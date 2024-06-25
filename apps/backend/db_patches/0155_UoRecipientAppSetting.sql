DO
$$
BEGIN
  IF register_patch('0155_UoRecipientAppSetting.sql', 'Simon Fernandes', 'UO Recipient App Setting', '2024-05-15') THEN
    BEGIN

      INSERT INTO settings(settings_id, description) VALUES ('USER_OFFICE_EMAIL', 'Email address for the user office. E.g. ''useroffice1@email.com; useroffice2@email.com''');

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
