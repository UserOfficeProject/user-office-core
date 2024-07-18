DO
$$
BEGIN
  IF register_patch('0158_BccRecipientAppSetting.sql', 'Deepak Jaison', 'BCC Recipient App Setting', '2024-07-17') THEN
    BEGIN

      INSERT INTO settings(settings_id, description) VALUES ('BCC_EMAIL', 'Email address for setting bcc recipient. E.g. ''bcc1@email.com; bcc2@email.com''');

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
