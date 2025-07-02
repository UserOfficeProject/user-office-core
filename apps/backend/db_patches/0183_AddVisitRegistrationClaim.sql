DO
$$
BEGIN
    IF register_patch(
        'AddVisitRegistrationClaim.sql',
        'Jekabs Karklins',
        'Adding table to store visit registration claims',
        '2025-06-04'
    ) THEN
        BEGIN
            -- Create the visit_registration_claims table
            CREATE TABLE IF NOT EXISTS visit_registration_claims (
                invite_id INT NOT NULL,
                visit_id INT NOT NULL,
                FOREIGN KEY (invite_id) REFERENCES invites(invite_id) ON DELETE CASCADE,
                FOREIGN KEY (visit_id) REFERENCES visits(visit_id) ON DELETE CASCADE,
                UNIQUE (invite_id, visit_id)
            );

            ALTER TABLE visit_registration_claims ADD CONSTRAINT visit_registration_unique
            UNIQUE (invite_id, visit_id);
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
