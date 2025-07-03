DO
$$
BEGIN
	IF register_patch('0178_AddExperimentEvents.sql', 'Yoganandan Pandiyan', 'Add experiment events table to keep track of all fired events on a experiment.', '2025-04-21') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS experiment_safety_events (
				experiment_pk INT REFERENCES experiments(experiment_pk) ON DELETE CASCADE,
				PRIMARY KEY(experiment_pk),
				experiment_safety_management_decision_submitted_by_is BOOLEAN DEFAULT FALSE,
				experiment_safety_management_decision_submitted_by_esr BOOLEAN DEFAULT FALSE,
				experiment_esf_submitted BOOLEAN DEFAULT FALSE,
				experiment_esf_approved_by_is BOOLEAN DEFAULT FALSE,
				experiment_esf_rejected_by_is BOOLEAN DEFAULT FALSE,
				experiment_esf_approved_by_esr BOOLEAN DEFAULT FALSE,
				experiment_esf_rejected_by_esr BOOLEAN DEFAULT FALSE,
				experiment_safety_status_changed_by_workflow BOOLEAN DEFAULT FALSE,
				experiment_safety_status_changed_by_user BOOLEAN DEFAULT FALSE
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;