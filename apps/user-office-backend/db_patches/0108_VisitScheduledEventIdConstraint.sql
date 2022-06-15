DO
$$
BEGIN
    IF register_patch('VisitScheduledEventIdConstraint.sql', 'Jekabs Karklins', 'Referecing scheduled_event_id from visits table', '2021-10-13') THEN

    -- removing composite PKEY
    ALTER TABLE scheduled_events
    DROP CONSTRAINT scheduled_events_pkey;

    -- addding PKEY to scheduled_event_id
    ALTER TABLE scheduled_events 
    ADD PRIMARY KEY (scheduled_event_id);

    -- referencing scheduled_events.scheduled_event_id field form visits.scheduled_event_id
    ALTER TABLE visits
        ADD CONSTRAINT visits_scheduled_events_scheduled_event_id_fkey
            FOREIGN KEY (scheduled_event_id)
            REFERENCES scheduled_events(scheduled_event_id)
            ON DELETE CASCADE;

    END IF;
END;
$$
LANGUAGE plpgsql;