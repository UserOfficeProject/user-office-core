DO
$$
BEGIN
  IF register_patch('0170_AddIsEmailSent', 'Jekabs Karklins', 'Add is_sent column to invites, to indicate if the email was accepted for the delivery by the EMAILSERVICE', '2025-02-04') THEN
    BEGIN
      ALTER TABLE invites ADD COLUMN is_email_sent BOOLEAN DEFAULT FALSE;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
