DO
$$
BEGIN
  IF register_patch('0166_CreateRedeemCodes', 'Jekabs Karklins', 'Adding new table for proposal_invites', '2024-12-03') THEN
    BEGIN

      CREATE TABLE proposal_invitation_codes (
        proposal_invite_id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        proposal_pk INT NOT NULL REFERENCES proposals (proposal_pk) ON DELETE CASCADE,
        creator_user_id INT NOT NULL REFERENCES users (user_id) ON DELETE SET NULL,
        is_email_sent BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
