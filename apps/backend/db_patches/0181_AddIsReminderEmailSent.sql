DO
$$
BEGIN
    IF register_patch(
        '0181_AddReminderEmailSentToInvites.sql',
        'Jekabs Karklins',
        'Add INVITE_REMINDERS_SEND_DELAY_DAYS app setting',
        '2025-05-13'
    ) THEN
        BEGIN
            INSERT INTO settings (settings_id, settings_value, description) 
                VALUES ('INVITE_REMINDERS_SEND_DELAY_DAYS', '', 'Delay when to send the reminder about pending invites. For multiple reminders specify comma separated values e.g. 7,14. To disable leave empty.'); 
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
