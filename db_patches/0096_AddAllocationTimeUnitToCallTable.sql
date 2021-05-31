DO
$$
BEGIN
	IF register_patch('AddAllocationTimeUnitToCallTable.sql', 'martintrajanovski', 'Add proposal allocation time unit to call table', '2021-05-31') THEN
		BEGIN

			ALTER TABLE call ADD COLUMN allocation_time_unit INTEGER NOT NULL DEFAULT 0;

		END;
	END IF;
END;
$$
LANGUAGE plpgsql;