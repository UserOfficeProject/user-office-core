-- 0181_RemoveUserColumns.sql
DO
$$
BEGIN
    IF register_patch(
        '0182_RemoveUserColumns2.sql',
        'Fredrik Bolmsten',
        'Remove gender, telephone, username, position, placeholder, birthdate and department columns from users table',
        '2025-05-12'
    ) THEN
        BEGIN
            -- now drop the unwanted columns
            ALTER TABLE public.users
                DROP COLUMN username,
                DROP COLUMN gender,
                DROP COLUMN birthdate,
                DROP COLUMN department,
                DROP COLUMN position,
                DROP COLUMN telephone;
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
