DO
$DO$
BEGIN
  IF register_patch('AddLocalContactToScheduledEvents.sql', 'Martin Trajanovski', 'Add local contact person to the scheduled event', '2021-12-08') THEN
  BEGIN

    ALTER TABLE "scheduled_events"
    ADD COLUMN IF NOT EXISTS "local_contact" int DEFAULT NULL
    REFERENCES users(user_id) ON DELETE SET NULL;

  END;
  END IF;
END;
$DO$
LANGUAGE plpgsql;
