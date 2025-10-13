
DO
$$
BEGIN
	IF register_patch('AddUniqueConstraintToOidcSub.sql', 'yoganandanpandiyan', 'Unique constraint', '2025-10-13') THEN
    BEGIN
        ALTER TABLE users ADD CONSTRAINT unique_oidc_sub UNIQUE (oidc_sub);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
