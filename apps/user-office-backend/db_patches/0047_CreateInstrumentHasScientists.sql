DO
$$
BEGIN
	IF register_patch('InstrumentHasScientists.sql', 'martintrajanovski', 'instrument_has_scientists table creation', '2020-06-26') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "instrument_has_scientists" (
      instrument_id int REFERENCES instruments (instrument_id) ON UPDATE CASCADE,
      user_id int REFERENCES users (user_id) ON UPDATE CASCADE,
      CONSTRAINT instrument_has_scientists_pkey PRIMARY KEY (instrument_id, user_id)  -- explicit pk
    );

    INSERT INTO roles (short_code, title) VALUES ('instrument_scientist', 'Instrument Scientist');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;