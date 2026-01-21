DO
$$
BEGIN
    IF register_patch(
        '0206_DeleteFeatureEmailInviteLegacy.sql',
        'Yoganandan Pandiyan',
        'Delete feature EMAIL_INVITE_LEGACY',
        '2026-01-21'
    ) THEN
        BEGIN
           DELETE FROM features WHERE feature_id = 'EMAIL_INVITE_LEGACY';
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
