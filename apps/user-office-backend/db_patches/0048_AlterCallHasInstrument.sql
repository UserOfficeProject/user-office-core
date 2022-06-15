DO
$$
BEGIN
	IF register_patch('AlterCallHasInstrument.sql', 'martintrajanovski', 'Add availability_time to call_has_instruments', '2020-06-30') THEN
	BEGIN

        ALTER TABLE call_has_instrument ADD COLUMN availability_time INTEGER;

        ALTER TABLE call_has_instrument
        RENAME TO call_has_instruments;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;