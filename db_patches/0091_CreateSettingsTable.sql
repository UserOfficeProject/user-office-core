DO
$$
DECLARE 
add_value varchar;
BEGIN
	IF register_patch('CreateSettings.sql', 'Alberto Popescu', 'Create Settings', '2021-03-25') THEN
	BEGIN

      CREATE TABLE settings (
            settings_id VARCHAR(128) PRIMARY KEY
          , add_value  VARCHAR 
          , description VARCHAR(500) NOT NULL DEFAULT ''
      ); 

      INSERT INTO 
        settings(settings_id, add_value, description)
      VALUES
        ('externalAuthLoginUrl', 'https://devusers.facilities.rl.ac.uk/auth/Login.aspx', 'P&O Login URL');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;