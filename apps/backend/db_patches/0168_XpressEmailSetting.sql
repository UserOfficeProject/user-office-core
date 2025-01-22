DO
$$
BEGIN
  IF register_patch('0168_XpressEmailSetting.sql', 'Chi Kai Lam', 'Xpress email setting for recipients SAMPLE_SAFETY_EMAIL and TECHNIQUE_SCIENTISTS_EMAIL', '2025-01-13') THEN
    BEGIN
      INSERT INTO settings (settings_id, settings_value, description) VALUES ('SAMPLE_SAFETY_EMAIL', '', 'Email address for the sample safety.'); 
      INSERT INTO settings (settings_id, settings_value, description) VALUES ('TECHNIQUE_SCIENTISTS_EMAIL', '', 'Email address for the Xpress technique scientist.');
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
