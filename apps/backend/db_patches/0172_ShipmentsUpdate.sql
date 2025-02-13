DO
$$
BEGIN
  IF register_patch('0172_ShipmentsUpdate', 'Yoganandan Pandiyan', 'Updating the Shipments to refer to the new Experiments table', '2025-02-13') THEN
    ALTER TABLE shipments
    ADD COLUMN experiment_pk INT NOT NULL REFERENCES experiments(experiment_pk);

    ALTER TABLE shipments DROP COLUMN scheduled_event_id;
  END IF;
END;
$$
LANGUAGE plpgsql;