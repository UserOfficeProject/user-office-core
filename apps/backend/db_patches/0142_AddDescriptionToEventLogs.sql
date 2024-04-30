DO
$$
BEGIN
	IF register_patch('AddDescriptionToEventLogs.sql', 'martintrajanovski', 'Add description column to the event logs table', '2023-11-08') THEN
		BEGIN
    	ALTER TABLE event_logs 
			ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;