DO
$$
BEGIN
	IF register_patch('AddNextStatusEvents.sql', 'martintrajanovski', 'Add proposal workflow next status events table.', '2020-10-16') THEN
	  BEGIN
			ALTER TABLE proposal_workflow_connections DROP COLUMN next_status_event_type;

			CREATE TABLE IF NOT EXISTS next_status_events (
					next_status_event_id SERIAL PRIMARY KEY,
					proposal_workflow_connection_id INT REFERENCES proposal_workflow_connections(proposal_workflow_connection_id) ON DELETE CASCADE,
					next_status_event VARCHAR(50) NOT NULL
			);

			ALTER TABLE next_status_events ADD CONSTRAINT unique_connection_event UNIQUE (proposal_workflow_connection_id, next_status_event);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;