DO
$$
BEGIN
    IF register_patch('0172_CreatEmailInviteLegacyFeature.sql', 'Jekabs Karklins', 'Add temporary email feature toggle for legacy flow', '2021-10-20') THEN

    INSERT INTO features(feature_id, is_enabled, description) 
    VALUES ('EMAIL_INVITE_LEGACY', true, 'Email inviatation legacy flow functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;
