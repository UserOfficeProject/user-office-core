DO
$$
BEGIN
    IF register_patch(
        '0214_CreateInvitationTables.sql',
        '<author>',
        'Create invitations and invitation_claims tables for the unified invite system',
        '2026-07-14'
    ) THEN
        BEGIN
            CREATE TABLE invitations (
                id             SERIAL PRIMARY KEY,
                code           VARCHAR(6) NOT NULL UNIQUE,
                created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                accepted_at    TIMESTAMPTZ NULL,
                expired_at     TIMESTAMPTZ NULL,
                created_by     INT NOT NULL REFERENCES users(user_id),
                invited_email  VARCHAR(255) NOT NULL,
                email_sent     BOOLEAN NOT NULL DEFAULT FALSE,
                email_template VARCHAR(255) NULL
            );
            CREATE INDEX invitations_code_idx ON invitations(code);
            CREATE INDEX invitations_invited_email_idx ON invitations(invited_email);

            CREATE TABLE invitation_claims (
                claim_id       SERIAL PRIMARY KEY,
                invitation_id  INT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
                role_id        INT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
                entity_id      INT NULL,
                variant        VARCHAR(32) NOT NULL
                                 CHECK (variant IN ('ROLE', 'CO_PROPOSER', 'VISIT_REGISTRATION')),
                variant_entity VARCHAR(32) NULL
                                 CHECK (variant_entity IN ('PROPOSAL', 'VISIT')),
                processed      BOOLEAN NOT NULL DEFAULT FALSE
            );
            CREATE INDEX invitation_claims_invitation_id_idx ON invitation_claims(invitation_id);
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
