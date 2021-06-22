DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('CreateFeatureToggle.sql', 'jekabskarklins', 'Create Feature Toggle', '2021-01-13') THEN
	BEGIN

      CREATE TABLE features (
            feature_id VARCHAR(128) PRIMARY KEY
          , is_enabled BOOLEAN DEFAULT false 
          , description VARCHAR(500) NOT NULL DEFAULT ''
      ); 

      INSERT INTO 
        features(feature_id, description)
      VALUES
        ('SHIPPING', 'Shipping feature');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;