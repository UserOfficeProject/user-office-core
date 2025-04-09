DO
$$
BEGIN
  IF register_patch('0173_InviteValidityPeriod.sql', 'Jekabs Karklins', 'Invite validity period in days', '2025-03-24') THEN
    BEGIN
      INSERT INTO settings(settings_id, settings_value, description) 
      VALUES (
        'INVITE_VALIDITY_PERIOD_DAYS', 
        '365', 
        'Number of days an invitation remains valid after creation before expiring. Must be a positive integer.'
      );
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
