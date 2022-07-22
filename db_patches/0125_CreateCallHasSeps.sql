DO
$$
BEGIN
	IF register_patch('CreateCallHasSeps.sql', 'martintrajanovski', 'Create call_has_seps table', '2022-06-29') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "call_has_seps" (
      call_id int REFERENCES call (call_id) ON UPDATE CASCADE ON DELETE CASCADE,
      sep_id int REFERENCES "SEPs" (sep_id) ON UPDATE CASCADE ON DELETE CASCADE,
      CONSTRAINT call_has_seps_pkey PRIMARY KEY (call_id, sep_id)  -- explicit pk
    );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;