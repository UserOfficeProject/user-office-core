DO
$$
BEGIN
  IF register_patch('0169_RenameClaimsInvites', 'Jekabs Karklins', 'Changing the naming to be more clear and consistant', '2025-01-27') THEN
    BEGIN
      ALTER TABLE co_proposer_invites RENAME TO co_proposer_claims;
      ALTER TABLE co_proposer_claims RENAME COLUMN co_proposer_invite_id TO co_proposer_claim_id;

      ALTER TABLE role_invites RENAME TO role_claims;
      ALTER TABLE role_claims RENAME COLUMN role_invite_id TO role_claim_id;
      ALTER TABLE role_claims RENAME COLUMN invite_code_id TO invite_id;

      ALTER TABLE invite_codes RENAME TO invites;
      ALTER TABLE invites RENAME COLUMN invite_code_id TO invite_id;
      ALTER TABLE co_proposer_claims RENAME COLUMN invite_code_id TO invite_id;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
