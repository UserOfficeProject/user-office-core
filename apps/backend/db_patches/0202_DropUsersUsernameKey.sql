DO
$$
BEGIN
    IF register_patch('DropUsersUsernameKey.sql', 'jekabskarklins', 'Deprecate username constraint. This fix is needed for the broken integration that is underway', '2025-12-11') THEN
        BEGIN
            ALTER TABLE IF EXISTS public.users
            DROP CONSTRAINT users_username_key;
        END;
    END IF;
END;
$$
