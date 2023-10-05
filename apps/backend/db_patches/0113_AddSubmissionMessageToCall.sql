DO
$$
BEGIN
    IF register_patch('AddCallMessageToCall.sql', 'Vlad Ionica', 'Add call message to call', '2021-11-09') THEN

    ALTER TABLE call
        ADD COLUMN submission_message text;
    END IF;
END;
$$
LANGUAGE plpgsql;