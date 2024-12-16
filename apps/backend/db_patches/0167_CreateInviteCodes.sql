DO
$$
BEGIN
  IF register_patch('0167_CreateInviteCode', 'Jekabs Karklins', 'Adding tables for invites', '2024-12-03') THEN
    BEGIN

      CREATE TABLE invite_codes (
        invite_code_id SERIAL PRIMARY KEY,
        code VARCHAR(12) NOT NULL,
        email VARCHAR(255) NOT NULL,
        note TEXT DEFAULT '',
        created_by INT NOT NULL REFERENCES users(user_id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        claimed_by INT REFERENCES users(user_id),
        claimed_at TIMESTAMPTZ
      );
      CREATE INDEX invite_codes_code_idx ON invite_codes(code);

      CREATE TABLE role_invites (
        role_invite_id SERIAL PRIMARY KEY,
        invite_code_id INT NOT NULL REFERENCES invite_codes(invite_code_id) ON DELETE CASCADE,
        role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE
      );
      CREATE INDEX role_invites_invite_code_id_idx ON role_invites(invite_code_id);

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
