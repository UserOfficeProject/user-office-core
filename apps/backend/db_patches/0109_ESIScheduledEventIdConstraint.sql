DO
$$
BEGIN
    IF register_patch('ESIScheduledEventIdConstraint.sql', 'Jekabs Karklins', 'Referecing scheduled_event_id from visits table', '2021-10-13') THEN

    -- removing reference to visits_table
    ALTER TABLE experiment_safety_inputs
    DROP CONSTRAINT experiment_safety_inputs_visit_id_fkey;

    ALTER TABLE experiment_safety_inputs
    RENAME COLUMN visit_id to scheduled_event_id;

    

    -- updating references to the scheduled_events table
    CREATE OR REPLACE FUNCTION update_references() RETURNS SETOF experiment_safety_inputs AS
    $BODY$
    DECLARE
        r experiment_safety_inputs%rowtype;
    BEGIN
        FOR r IN
                select * from experiment_safety_inputs
        LOOP
            UPDATE experiment_safety_inputs 
            SET scheduled_event_id = (SELECT scheduled_event_id FROM visits WHERE visit_id = r.scheduled_event_id)
            WHERE esi_id=r.esi_id;
            RETURN NEXT r;
        END LOOP;
        RETURN;
    END;
    $BODY$
    LANGUAGE plpgsql;


    PERFORM update_references();


    DROP FUNCTION update_references();


    ALTER TABLE experiment_safety_inputs
        ADD CONSTRAINT experiment_safety_inputs_scheduled_events_scheduled_event_id_fkey
            FOREIGN KEY (scheduled_event_id)
            REFERENCES scheduled_events(scheduled_event_id)
            ON DELETE CASCADE;

    END IF;
END;
$$
LANGUAGE plpgsql;