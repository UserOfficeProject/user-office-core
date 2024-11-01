DO
$$
BEGIN
  IF register_patch('0164_UserIdInApiMetadataFeature.sql', 'Alex Lay', 'UserId in API metadata feature', '2024-10-31') THEN
    BEGIN

      INSERT INTO features(feature_id, description) VALUES ('USER_ID_IN_API_METADATA', 'UserId will be included in a client header from the frontend if flag is enabled');

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
