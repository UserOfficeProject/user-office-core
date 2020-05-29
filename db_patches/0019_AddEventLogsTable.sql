DO
$$
BEGIN
	IF register_patch('AddEventLogsTable.sql', 'martintrajanovski', ' Adding new table for storing events.', '2020-03-04') THEN
	BEGIN


  
        CREATE TABLE IF NOT EXISTS event_logs(
            id serial PRIMARY KEY,
            changed_by int REFERENCES users (user_id),
            event_type text DEFAULT NULL,
            row_data text DEFAULT NULL,
            event_tstamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            changed_object_id text DEFAULT NULL
        );



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
