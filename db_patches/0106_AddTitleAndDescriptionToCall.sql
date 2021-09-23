DO
$$
BEGIN
    IF register_patch('AddTitleAndDescriptionToCall.sql', 'Panda Rushwood', 'Add title and description to call', '2021-09-16') THEN

    ALTER TABLE call
        ADD COLUMN title varchar(100),
        ADD COLUMN description text;

    END IF;
END;
$$
LANGUAGE plpgsql;