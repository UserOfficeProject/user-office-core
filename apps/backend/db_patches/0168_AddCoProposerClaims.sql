DO
$$
BEGIN
  IF register_patch('0168_CreateCoProposerInvite', 'Jekabs Karklins', 'Adding co-proposer claims', '2025-01-10') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS co_proposer_invites (
        invite_code_id INT NOT NULL REFERENCES invite_codes(invite_code_id) ON DELETE CASCADE,
        proposal_pk INT NOT NULL REFERENCES proposals(proposal_pk) ON DELETE CASCADE,
        PRIMARY KEY (invite_code_id, proposal_pk));
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
