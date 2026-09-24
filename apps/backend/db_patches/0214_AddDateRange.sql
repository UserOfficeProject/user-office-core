DO
$$
BEGIN
	IF register_patch('AddDateTimeRange.sql', 'Zachary Hankin', 'Adding date time range picker type', '2026-08-13') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('DATE_TIME_RANGE');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;