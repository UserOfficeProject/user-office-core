
DO
$$
DECLARE
    duplicate_count INTEGER;
    duplicate_details TEXT;
BEGIN
    IF register_patch('AddUniqueConstraintToOidcSub.sql', 'yoganandanpandiyan', 'Unique constraint', '2025-10-13') THEN
        BEGIN
            -- Clean up empty string values in oidc_sub column by setting them to NULL
            -- This prevents empty strings from conflicting with the unique constraint
            UPDATE users
            SET oidc_sub = NULL
            WHERE oidc_sub = '';

            -- Check for duplicate oidc_sub values and throw error if any are found
            SELECT COUNT(*)
            INTO duplicate_count
            FROM (
                SELECT oidc_sub
                FROM users
                WHERE oidc_sub IS NOT NULL
                GROUP BY oidc_sub
                HAVING COUNT(*) > 1
            ) duplicates;

            IF duplicate_count > 0 THEN
                WITH duplicate_groups AS (
                    SELECT 
                        oidc_sub,
                        STRING_AGG(user_id::TEXT, ', ' ORDER BY user_id) AS user_ids
                    FROM users
                    WHERE oidc_sub IS NOT NULL
                      AND oidc_sub IN (
                          SELECT oidc_sub
                          FROM users
                          WHERE oidc_sub IS NOT NULL
                          GROUP BY oidc_sub
                          HAVING COUNT(*) > 1
                      )
                    GROUP BY oidc_sub
                )
                SELECT STRING_AGG(
                    FORMAT('oidc_sub: "%s" (user_ids: %s)', oidc_sub, user_ids), 
                    E'\n'
                )
                INTO duplicate_details
                FROM duplicate_groups;

                RAISE EXCEPTION 'Cannot add unique constraint to oidc_sub column. Found % duplicate oidc_sub value(s) that must be manually resolved:
%

Please manually fix these duplicate values before running this migration again. 
OIDC subject identifiers should be unique as they come from identity providers.',
                    duplicate_count, duplicate_details;
            END IF;

            -- Add unique constraint to prevent duplicate oidc_sub values in the future
            ALTER TABLE users 
            ADD CONSTRAINT unique_oidc_sub UNIQUE (oidc_sub);
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
