
DO
$$
BEGIN
    IF register_patch('AddUniqueConstraintToOidcSub.sql', 'yoganandanpandiyan', 'Unique constraint', '2025-10-13') THEN
        BEGIN
            -- Clean up empty string values in oidc_sub column by setting them to NULL
            -- This prevents empty strings from conflicting with the unique constraint
            UPDATE users
            SET oidc_sub = NULL
            WHERE oidc_sub = '';

            -- Handle duplicate oidc_sub values by appending a unique suffix. ex., '_1', '_2', etc.
            WITH duplicates AS (
                SELECT
                    user_id,
                    oidc_sub,
                    ROW_NUMBER() OVER (PARTITION BY oidc_sub ORDER BY user_id) AS rn
                FROM users
                WHERE oidc_sub IS NOT NULL
            )
            UPDATE users u
            SET oidc_sub = u.oidc_sub || '_' || d.rn
            FROM duplicates d
            WHERE u.user_id = d.user_id
              AND d.rn > 1;

            -- Add unique constraint to prevent duplicate oidc_sub values in the future
            ALTER TABLE users 
            ADD CONSTRAINT unique_oidc_sub UNIQUE (oidc_sub);
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
