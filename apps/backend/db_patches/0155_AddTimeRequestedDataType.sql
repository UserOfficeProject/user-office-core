DO
$$
BEGIN
	IF register_patch('AddTimeRequestedDataType.sql', 'Bhaswati Dey', 'Adding Time Requested data type', '2024-04-24') THEN
	BEGIN

        INSERT INTO question_datatypes VALUES('TIME_REQUESTED');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
