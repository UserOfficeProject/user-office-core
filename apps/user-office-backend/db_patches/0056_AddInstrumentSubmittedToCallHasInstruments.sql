DO
$$
BEGIN
	IF register_patch('AddInstrumentSubmittedToCallHasInstruments.sql', 'martintrajanovski', 'Add submitted flag in call_has_instruments', '2020-08-26') THEN
	BEGIN

      ALTER TABLE call_has_instruments ADD COLUMN submitted BOOLEAN DEFAULT FALSE;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;