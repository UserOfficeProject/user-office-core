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
      , "proposal_pk" int NOT NULL
      , "status" varchar(30) NOT NULL
      , PRIMARY KEY (scheduled_event_id, proposal_booking_id)
    );

    END IF;
END;
$$
LANGUAGE plpgsql;