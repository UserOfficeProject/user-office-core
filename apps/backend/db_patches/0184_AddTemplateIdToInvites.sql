DO
$$
BEGIN
    IF register_patch(
        'AddTemplateIdToInvites.sql',
        'Jekabs Karklins',
        'Adding template_id column to invites table so that we can track which template was used for the invite',
        '2025-06-04'
    ) THEN
        BEGIN
            -- Add the template_id column to the invites table
            ALTER TABLE invites ADD COLUMN template_id VARCHAR(255) NULL;
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
