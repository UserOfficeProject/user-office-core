DO
$$
BEGIN
  IF register_patch('AddScheduledEventsTable.sql', 'Martin Trajanovski', 'Add scheduled_events table to store the scheduler information needed for the core frontend and remove the dependency', '2021-09-20') THEN

    CREATE TABLE IF NOT EXISTS "scheduled_events" (
        "scheduled_event_id" int NOT NULL
      , "booking_type" varchar(30) NOT NULL
      , "starts_at" TIMESTAMP NOT NULL
      , "ends_at" TIMESTAMP NOT NULL
      , "proposal_booking_id" int NOT NULL
      , "proposal_pk" int REFERENCES proposals(proposal_pk) ON DELETE CASCADE
      , "status" varchar(30) NOT NULL
      , PRIMARY KEY (scheduled_event_id, proposal_booking_id)
    );

    /*
    * Check if proposal_booking_id or proposal_pk already exists and the new pair is different than the existing one
    * then raise exception because this is not allowed. One proposal can be connected with only one proposal_booking
    * and all scheduled events should go under that pair.
    */
    CREATE OR REPLACE FUNCTION before_scheduled_events_insert_or_update() RETURNS trigger AS $body$
      DECLARE 
      t_row scheduled_events%rowtype;
      BEGIN
        FOR 
          t_row IN SELECT * FROM scheduled_events
          WHERE proposal_booking_id = new.proposal_booking_id
          OR proposal_pk = new.proposal_pk
        LOOP
          IF 
            (new.proposal_booking_id = t_row.proposal_booking_id AND new.proposal_pk = t_row.proposal_pk)
          THEN
            RETURN NEW;
          ELSE
            RAISE EXCEPTION 'Invalid operation (proposal_booking_id or proposal_pk already exists in another pair and this is not allowed)';
          END IF;
        END LOOP;
        RETURN NEW;
      END;
    $body$ LANGUAGE 'plpgsql';

    CREATE TRIGGER scheduled_events_update_insert_trigger
    BEFORE INSERT OR UPDATE ON scheduled_events
    FOR EACH ROW EXECUTE PROCEDURE before_scheduled_events_insert_or_update();

  END IF;
END;
$$
LANGUAGE plpgsql;