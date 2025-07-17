DO
$$
BEGIN
  IF register_patch('0183_Tags', 'TCMeldrum', 'Add tags feature', '2025-01-10') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS tag
      (
        tag_id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        short_code VARCHAR(20) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tag_instrument
      (
          tag_id integer NOT NULL REFERENCES tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
          instrument_id integer NOT NULL REFERENCES instruments (instrument_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (tag_id, instrument_id)
      );

      CREATE TABLE IF NOT EXISTS tag_call
      (
          tag_id integer NOT NULL REFERENCES tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
          call_id integer NOT NULL REFERENCES call (call_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (tag_id, call_id)
      );

      INSERT INTO features(feature_id, description) VALUES ('TAGS', 'Tags feature');
 

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
