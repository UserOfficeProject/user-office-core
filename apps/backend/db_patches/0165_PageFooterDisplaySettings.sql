DO
$$
BEGIN
  IF register_patch('0165_PageFooterDisplaySettings.sql', 'TCMeldrum', 'Page Footer Display Links Settings', '2024-10-30') THEN
    BEGIN

      INSERT INTO settings(settings_id, description) 
        VALUES ('DISPLAY_FAQ_LINK', 
                'Should we display the FAQ link in the footer'
                );

      INSERT INTO settings(settings_id, description) 
        VALUES ('DISPLAY_PRIVACY_STATEMENT_LINK', 
                'Should we display the privacy statement link in the footer'
                );


    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
