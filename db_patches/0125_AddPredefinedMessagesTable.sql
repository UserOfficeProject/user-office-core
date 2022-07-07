DO
$DO$
BEGIN
  IF register_patch('AddPredefinedMessagesTable.sql', 'Martin Trajanovski', 'Add predefined_messages database table', '2022-07-07') THEN
  BEGIN

    CREATE TABLE predefined_messages (
      predefined_message_id serial PRIMARY KEY,
      short_code TEXT,
      message TEXT,
      date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_modified_by int REFERENCES users (user_id)
    ); 

  END;
  END IF;
END;
$DO$
LANGUAGE plpgsql;
