DO
$DO$
BEGIN
  IF register_patch('AddFeebackRequests.sql', 'Jekabs Karklins', 'Add feedback requests to scheduled_events', '2021-12-28') THEN
  BEGIN

    CREATE TABLE feedback_requests (
          feedback_request_id serial PRIMARY KEY
        , scheduled_event_id INT NOT NULL REFERENCES scheduled_events(scheduled_event_id) ON DELETE CASCADE
        , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    ); 

  END;
  END IF;
END;
$DO$
LANGUAGE plpgsql;
