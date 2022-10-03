DO
$$
BEGIN
	IF register_patch('MakeSafetyInputUnique.sql', 'jekabskarklins', 'Make safety input unique', '2022-09-22') THEN
	BEGIN

    ALTER TABLE experiment_safety_inputs
    ADD CONSTRAINT experiment_safety_inputs_scheduled_event_id_key UNIQUE (scheduled_event_id);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;