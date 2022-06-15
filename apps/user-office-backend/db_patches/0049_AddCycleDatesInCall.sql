DO
$$
BEGIN
	IF register_patch('AddCycleDatesInCall.sql', 'martintrajanovski', 'Add start_cycle and end_cycle in call', '2020-07-02') THEN
	BEGIN

      ALTER TABLE call ADD COLUMN start_cycle TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE call ADD COLUMN end_cycle TIMESTAMPTZ NOT NULL DEFAULT NOW();

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;