DO
$$
BEGIN
	IF register_patch('CreateSamplesTable.sql', 'jekabskarklins', 'Create samples table', '2020-07-14') THEN
	BEGIN

      CREATE TABLE samples (
            sample_id serial PRIMARY KEY
          , creator_id int REFERENCES users (user_id)
          , title varchar(100)
          , questionary_id int REFERENCES questionaries (questionary_id) ON DELETE CASCADE
          , status int NOT NULL DEFAULT 0
          , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ); 
      

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;