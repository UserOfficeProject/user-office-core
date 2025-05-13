DO
$$
BEGIN
    IF register_patch(
        '0181_AddReminderEmailSentToInvites.sql',
        'Jekabs Karklins',
        'Add is_reminder_email_sent to invites',
        '2025-05-13'
    ) THEN
        BEGIN
            ALTER TABLE public.invites
                ADD COLUMN is_reminder_email_sent BOOLEAN DEFAULT FALSE;
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
