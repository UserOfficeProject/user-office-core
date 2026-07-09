DO
$$
BEGIN
	IF register_patch('AddDateRangePicker.sql', 'Zachary Hankin', 'Adding date range picker type', '2026-07-07') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('DATE_RANGE_PICKER');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;