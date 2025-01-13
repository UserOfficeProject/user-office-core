DO
$$
BEGIN
  IF register_patch('0168_CreateCoProposerInvite', 'Jekabs Karklins', 'Adding co-proposer claims', '2025-01-10') THEN
    BEGIN
      CREATE TABLE co_proposer_invites (
        role_invite_id SERIAL PRIMARY KEY,
        invite_code_id INT NOT NULL REFERENCES invite_codes(invite_code_id) ON DELETE CASCADE,
        role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE
      );
      CREATE INDEX co_proposer_invites_invite_code_id_idx ON co_proposer_invites(invite_code_id);

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
