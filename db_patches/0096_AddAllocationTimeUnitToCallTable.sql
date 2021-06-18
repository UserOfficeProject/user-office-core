DO
$$
BEGIN
	IF register_patch('AddAllocationTimeUnitToCallTable.sql', 'martintrajanovski', 'Add proposal allocation time unit to call table', '2021-05-31') THEN
		BEGIN

			ALTER TABLE call ADD COLUMN allocation_time_unit VARCHAR(10) CHECK(allocation_time_unit IN ('day', 'hour')) NOT NULL DEFAULT 'day';

		END;
	END IF;
END;
$$
LANGUAGE plpgsql;