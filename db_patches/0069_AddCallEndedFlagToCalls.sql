DO
$$
BEGIN
	IF register_patch('AddCallEndedFlagToCalls.sql', 'martintrajanovski', 'Add call_ended flag to calls', '2020-10-30') THEN
        BEGIN
            ALTER TABLE call ADD COLUMN call_ended BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;