DO
$$
BEGIN
  IF register_patch('0157_AddTechniques.sql', 'Deepak Jaison & Simon Fernandes', 'Add techniques', '2024-06-05') THEN
    BEGIN

      CREATE TABLE techniques (
        technique_id  integer NOT NULL,
        name character varying(200) NOT NULL,
        short_code character varying(20) NOT NULL,
        description text,
        PRIMARY KEY (technique_id)
      );

      CREATE TABLE technique_has_instruments (
        technique_id integer NOT NULL,
        instrument_id integer NOT NULL,
        PRIMARY KEY (technique_id, instrument_id)
      );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
