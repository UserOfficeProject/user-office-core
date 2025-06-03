DO
$$
BEGIN
  IF register_patch('0183_Faclities', 'TCMeldrum', 'Add facilitys feature', '2025-01-10') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS facility
      (
        facility_id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        short_code VARCHAR(20) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS facility_instrument
      (
          facility_id integer NOT NULL REFERENCES facility (facility_id) ON UPDATE CASCADE ON DELETE CASCADE,
          instrument_id integer NOT NULL REFERENCES instruments (instrument_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (facility_id, instrument_id)
      );

      CREATE TABLE IF NOT EXISTS facility_call
      (
          facility_id integer NOT NULL REFERENCES facility (facility_id) ON UPDATE CASCADE ON DELETE CASCADE,
          call_id integer NOT NULL REFERENCES call (call_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (facility_id, call_id)
      );

      INSERT INTO features(feature_id, description) VALUES ('FACILITIES', 'Facilities feature');
 

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
