DO
$DO$
BEGIN
  IF register_patch('AttachShipmentToScheduledEvent.sql', 'Jekabs Karklins', 'Associate shipment with scheduled event', '2022-01-05') THEN
  BEGIN

    -- add scheduled_event_id column to shipments table
    ALTER TABLE "shipments"
    ADD COLUMN IF NOT EXISTS "scheduled_event_id" int DEFAULT NULL
    REFERENCES scheduled_events(scheduled_event_id) ON DELETE SET NULL;

    -- update scheduled_event_id column
    UPDATE shipments
    SET scheduled_event_id = ( 
        SELECT visits.scheduled_event_id
        FROM visits
        WHERE visits.visit_id = shipments.visit_id
    );

    -- remove visit_id column from shipments table
    ALTER TABLE "shipments"
    DROP COLUMN IF EXISTS "visit_id";

    -- remove Default value from scheduled_event_id column
    ALTER TABLE "shipments"
    ALTER COLUMN "scheduled_event_id" DROP DEFAULT;

  END;
  END IF;
END;
$DO$
LANGUAGE plpgsql;
