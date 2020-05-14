DO
$$
BEGIN
	IF register_patch('AlterCallsDateFormats.sql', 'martintrajanovski', 'Change of date fields type timestamp', '2020-05-14') THEN
	BEGIN

    ALTER table "call" alter start_call type TIMESTAMPTZ;
    ALTER table "call" alter end_call type TIMESTAMPTZ;
    ALTER table "call" alter start_review type TIMESTAMPTZ;
    ALTER table "call" alter end_review type TIMESTAMPTZ;
    ALTER table "call" alter start_notify type TIMESTAMPTZ;
    ALTER table "call" alter end_notify type TIMESTAMPTZ;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;