DO
$$
BEGIN
	IF register_patch('AddDateTimeRangePicker.sql', 'Zachary Hankin', 'Adding date time range picker type', '2026-07-07') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('DATE_TIME_RANGE_PICKER');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;