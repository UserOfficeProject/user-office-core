DO
$$
BEGIN
  IF register_patch('0158_AddTechniqueHasScientists.sql', 'Farai Mutambara', 'Add Technique Has Scientists', '2024-07-10') THEN
    BEGIN

      CREATE TABLE IF NOT EXISTS technique_has_scientists (
        technique_id integer NOT NULL REFERENCES techniques (technique_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_id int REFERENCES users (user_id) ON UPDATE CASCADE,
        PRIMARY KEY (technique_id, user_id)
      );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
