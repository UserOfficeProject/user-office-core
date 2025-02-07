DO
$$
BEGIN
  IF register_patch('0170_AddInviteFields', 'Jekabs Karklins', 'Add is_email_sent to track email acceptance and expiration_at for invite expiration.', '2025-02-04') THEN
    BEGIN
      ALTER TABLE invites ADD COLUMN is_email_sent BOOLEAN DEFAULT FALSE;
      ALTER TABLE invites ADD COLUMN expires_at timestamptz NULL;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
