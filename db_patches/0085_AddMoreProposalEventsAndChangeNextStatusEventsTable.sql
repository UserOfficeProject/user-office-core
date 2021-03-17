DO
$$
DECLARE 
   t_row record;
BEGIN
	IF register_patch('AddMoreProposalEvents.sql', 'martintrajanovski', 'Add proposal_unfeasible event', '2021-03-17') THEN
        BEGIN
            ALTER TABLE proposal_events ADD COLUMN proposal_unfeasible BOOLEAN DEFAULT FALSE;

            ALTER TABLE next_status_events RENAME COLUMN next_status_event_id TO status_changing_event_id;
            ALTER TABLE next_status_events RENAME COLUMN next_status_event TO status_changing_event;
            ALTER TABLE next_status_events RENAME TO status_changing_events;

            -- migrate next_status_events 
            FOR t_row in (
                SELECT * FROM status_changing_events
                INNER JOIN proposal_workflow_connections ON proposal_workflow_connections.proposal_workflow_connection_id = status_changing_events.proposal_workflow_connection_id
            ) LOOP
                UPDATE status_changing_events SET proposal_workflow_connection_id = subquery.proposal_workflow_connection_id
				FROM (SELECT * FROM proposal_workflow_connections WHERE proposal_status_id = t_row.next_proposal_status_id) AS subquery
				WHERE status_changing_events.status_changing_event_id = t_row.status_changing_event_id;
            END LOOP;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;