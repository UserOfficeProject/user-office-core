DO
$$
BEGIN
	IF register_patch('0158_AddEventIDAndEventStatusToEventlogs.sql', 'faraimutambara', 'Add event id and status columns to event logs table', '2024-07-08') THEN
		BEGIN
    	ALTER TABLE event_logs 
			ADD COLUMN event_id TEXT DEFAULT NULL,
      ADD COLUMN event_status TEXT DEFAULT NULL;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;