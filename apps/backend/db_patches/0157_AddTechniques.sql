DO
$$
BEGIN
  IF register_patch('0157_AddTechniques.sql', 'Deepak Jaison & Simon Fernandes', 'Add techniques', '2024-06-05') THEN
    BEGIN

      CREATE TABLE IF NOT EXISTS techniques (
        technique_id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        short_code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS technique_has_instruments (
        technique_id integer NOT NULL REFERENCES techniques (technique_id) ON UPDATE CASCADE ON DELETE CASCADE,
        instrument_id integer NOT NULL REFERENCES instruments (instrument_id) ON UPDATE CASCADE ON DELETE CASCADE,
        PRIMARY KEY (technique_id, instrument_id)
      );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
