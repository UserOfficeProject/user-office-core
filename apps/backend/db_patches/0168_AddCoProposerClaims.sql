DO
$$
BEGIN
  IF register_patch('0168_CreateCoProposerInvite', 'Jekabs Karklins', 'Adding co-proposer claims', '2025-01-10') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS co_proposer_invites (
        co_proposer_invite_id SERIAL PRIMARY KEY,
        invite_code_id INT NOT NULL REFERENCES invite_codes(invite_code_id) ON DELETE CASCADE,
        proposal_pk INT NOT NULL REFERENCES proposals(proposal_pk) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS co_proposer_co_proposer_invite_id_idx ON co_proposer_invites(co_proposer_invite_id);

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
