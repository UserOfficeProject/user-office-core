-- 0181_RemoveUserColumns.sql
DO
$$
BEGIN
    IF register_patch(
        '0181_RemoveUserColumns.sql',
        'Jekabs Karklins',
        'Remove middle name, nationality, and alternate telephone columns from users table',
        '2025-05-12'
    ) THEN
        BEGIN
            DELETE FROM features WHERE feature_id = 'EMAIL_INVITE_LEGACY';
            DROP TABLE IF EXISTS public.redeem_codes;
            -- first drop the FK on nationality
            ALTER TABLE public.users
                DROP CONSTRAINT IF EXISTS users_nationality_fkey;

            -- now drop the unwanted columns
            ALTER TABLE public.users
                DROP COLUMN middlename,
                DROP COLUMN nationality,
                DROP COLUMN telephone_alt;

            -- now drop the nationalities table
            DROP TABLE IF EXISTS public.nationalities;
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
