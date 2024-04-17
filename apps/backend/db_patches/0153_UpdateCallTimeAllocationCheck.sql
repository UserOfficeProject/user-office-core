DO
$$
BEGIN
    IF register_patch('0153_UpdateCallTimeAllocationCheck.sql', 'Thomas Cottee Meldrum', 'Update call to take weeks as allocated time', '2024-04-09') THEN

        ALTER TABLE IF EXISTS call DROP CONSTRAINT call_allocation_time_unit_check;
        ALTER TABLE IF EXISTS call ADD CONSTRAINT call_allocation_time_unit_check CHECK(allocation_time_unit IN ('day', 'hour', 'week'));

    END IF;
END;
$$
LANGUAGE plpgsql;