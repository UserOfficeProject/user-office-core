DO
$$
BEGIN
    IF register_patch('AddVisitRegistrationStartEndDates.sql', 'Jekabs Karklins', 'Add visit registration start and end dates', '2022-02-23') THEN

        ALTER TABLE visits_has_users
        ADD COLUMN starts_at timestamp without time zone DEFAULT NULL,
        ADD COLUMN ends_at timestamp without time zone DEFAULT NULL;

    END IF;
END;
$$
LANGUAGE plpgsql;