DO
$$
BEGIN
  IF register_patch('0163_XpressRouteFeature.sql', 'Simon Fernandes & Deepak Jaison', 'Xpress route Feature', '2024-08-09') THEN
    BEGIN

      INSERT INTO features(feature_id, description) VALUES ('STFC_XPRESS_MANAGEMENT', 'Xpress route management page will be visible if flag is enabled');


    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
