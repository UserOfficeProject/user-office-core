DO
$$
BEGIN
	IF register_patch('CreateInstruments.sql', 'martintrajanovski', 'Create instruments and call_has_instrument tables', '2020-06-12') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "instruments" (
      instrument_id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      short_code VARCHAR(20) NOT NULL,
      description TEXT NULL
    );

    CREATE TABLE IF NOT EXISTS "call_has_instrument" (
      call_id int REFERENCES call (call_id) ON UPDATE CASCADE,
      instrument_id int REFERENCES instruments (instrument_id) ON UPDATE CASCADE,
      CONSTRAINT call_has_instrument_pkey PRIMARY KEY (call_id, instrument_id)  -- explicit pk
    );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;