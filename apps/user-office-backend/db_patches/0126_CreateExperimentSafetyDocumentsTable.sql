DO
$$
BEGIN
	IF register_patch('CreateExperimentSafetyDocumentsTable.sql', 'jekabskarklins', 'Create experiment_safety_documents table', '2022-09-22') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "experiment_safety_documents" (
      esd_id SERIAL PRIMARY KEY,
      esi_id INT UNIQUE REFERENCES experiment_safety_inputs(esi_id) ON UPDATE CASCADE,
      reviewer_user_id INT REFERENCES users (user_id) ON UPDATE CASCADE,
      evaluation VARCHAR(255) NOT NULL CHECK (evaluation IN ('ACCEPTED', 'REJECTED')),
      comment TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      evaluated_at TIMESTAMP DEFAULT NOW()
    );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;