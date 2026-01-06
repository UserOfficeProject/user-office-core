DO
$$
BEGIN
    IF register_patch(
       'Migrate_workflow',
       'Jekabs Karklins',
       'Migrate workflow data to new structures.',
       '2026-01-05'
     ) THEN
      BEGIN


      



      DROP TABLE IF EXISTS status_changing_events;
      DROP TABLE IF EXISTS proposal_events;
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
