DO
$$
BEGIN
  IF register_patch('0174_DropInvitesColumnNote.sql', 'Jekabs Karklins', 'Drop column note from invites table', '2025-03-26') THEN
    BEGIN
      ALTER TABLE invites DROP COLUMN note;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
