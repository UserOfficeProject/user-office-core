DO
$$
BEGIN
    IF register_patch('UpdateCallTimeAllocationCheckWithShift.sql', 'Zachary Hankin', 'Update call to take shift as allocated time', '2026-06-08') THEN

        ALTER TABLE IF EXISTS call DROP CONSTRAINT call_allocation_time_unit_check;
        ALTER TABLE IF EXISTS call ADD CONSTRAINT call_allocation_time_unit_check CHECK(allocation_time_unit IN ('day', 'hour', 'week', 'shift'));

    END IF;
END;
$$
LANGUAGE plpgsql;