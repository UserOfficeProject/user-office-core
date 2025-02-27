DO
$$
BEGIN
  IF register_patch('0170_VisitsUpdate', 'Yoganandan Pandiyan', 'Updating the Visits to refer to the new Experiments table', '2025-02-13') THEN
    ALTER TABLE visits
    ADD COLUMN experiment_pk INT NOT NULL REFERENCES experiments(experiment_pk);

    ALTER TABLE visits DROP COLUMN scheduled_event_id;
  END IF;
END;
$$
LANGUAGE plpgsql;