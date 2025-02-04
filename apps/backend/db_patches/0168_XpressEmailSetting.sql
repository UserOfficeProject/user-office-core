DO
$$
BEGIN
  IF register_patch('0168_XpressEmailSetting.sql', 'Chi Kai Lam', 'Xpress email setting for recipients SAMPLE_SAFETY_EMAIL', '2025-01-24') THEN
    BEGIN
      INSERT INTO settings (settings_id, settings_value, description) VALUES ('SAMPLE_SAFETY_EMAIL', '', 'Email address for the sample safety team.'); 
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
