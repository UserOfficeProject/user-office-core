DO
$$
BEGIN
	IF register_patch('AddImpersonatingUserIdToEventLogs.sql', 'RasmiaKulan', 'Add impersonating user id column to the event logs table', '2025-06-09') THEN
		BEGIN
    	ALTER TABLE event_logs 
            ADD COLUMN impersonating_user_id INTEGER;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;