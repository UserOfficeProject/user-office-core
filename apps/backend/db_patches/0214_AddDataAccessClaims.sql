DO
$$
BEGIN
  IF register_patch('0214_AddDataAccessClaims', 'Shivam K', 'Adding data access user claims', '2026-06-26') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS data_access_claims (
        invite_id INT NOT NULL REFERENCES invites(invite_id) ON DELETE CASCADE,
        proposal_pk INT NOT NULL REFERENCES proposals(proposal_pk) ON DELETE CASCADE,
        PRIMARY KEY (invite_id, proposal_pk));
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
