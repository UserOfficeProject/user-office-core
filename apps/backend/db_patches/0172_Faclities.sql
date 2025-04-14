DO
$$
BEGIN
  IF register_patch('0172_Faclities', 'TCMeldrum', 'Add facilitys feature', '2025-01-10') THEN
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

      CREATE TABLE IF NOT EXISTS facility_user
      (
          user_id integer NOT NULL REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
          facility_id integer NOT NULL REFERENCES facility (facility_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (user_id, facility_id)
      );

      INSERT INTO roles (short_code, title, description) VALUES ('facility_member', 'Facility Member', 'View proposals to your facility');

      INSERT INTO features(feature_id, description) VALUES ('FACILITIES', 'Facilities feature');
 

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
