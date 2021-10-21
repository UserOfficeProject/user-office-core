DO
$$
BEGIN
    IF register_patch('CreatEmailInviteFeature.sql', 'Thomas Cottee Meldrum', 'Add Email Invite Feature', '2021-10-20') THEN

    INSERT INTO features(feature_id, description) VALUES ('EMAIL_INVITE', 'Email inviatation functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;
