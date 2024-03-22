DO
$$
BEGIN
    IF register_patch('UpdateEmailInviteFeature.sql', 'Scott Hurley', 'Update Email Invite Feature', '2024-03-18') THEN

    UPDATE features SET description='Email invitation functionality' WHERE feature_id = 'EMAIL_INVITE';

    END IF;
END;
$$
LANGUAGE plpgsql;