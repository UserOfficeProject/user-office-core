DO
$$
BEGIN
  IF register_patch('0169_ExperimentSafetyReview', 'Yoganandan Pandiyan', 'Reconstructing Experiment Safety review in accordance with the new requirement', '2025-02-11') THEN
    CREATE TABLE IF NOT EXISTS "experiments" (
        "experiment_pk" SERIAL PRIMARY KEY
      , "experiment_id" varchar(20) NOT NULL UNIQUE
      , "starts_at" TIMESTAMP NOT NULL
      , "ends_at" TIMESTAMP NOT NULL
      , "scheduled_event_id" INT NOT NULL
      , "proposal_pk" INT NOT NULL REFERENCES proposals(proposal_pk) ON DELETE CASCADE
      , "status" varchar(30) NOT NULL
      , "local_contact_id" INT REFERENCES users(user_id) ON DELETE SET NULL
      , "instrument_id" INT NOT NULL REFERENCES instruments (instrument_id)
      , "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      , "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "experiment_safety" (
        "experiment_safety_pk" SERIAL PRIMARY KEY
      , "experiment_pk" INT NOT NULL REFERENCES experiments(experiment_pk) ON DELETE CASCADE
      , "esi_questionary_id" INT NOT NULL REFERENCES questionaries(questionary_id)
      , "esi_questionary_submitted_at" TIMESTAMP
      , "created_by" INT NOT NULL REFERENCES users(user_id) ON DELETE SET NULL
      , "status" varchar(30) NOT NULL
      , "safety_review_questionary_id" INT NOT NULL REFERENCES questionaries(questionary_id)
      , "reviewed_by" INT REFERENCES users(user_id) ON DELETE SET NULL
      , "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      , "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "experiment_has_samples" (
      "experiment_pk" INT NOT NULL REFERENCES experiments(experiment_pk) ON DELETE CASCADE
      , "sample_id" INT NOT NULL REFERENCES samples(sample_id) ON DELETE CASCADE
      , "is_esi_submitted" BOOLEAN NOT NULL DEFAULT FALSE
      , "sample_esi_questionary_id" INT NOT NULL REFERENCES questionaries(questionary_id)
      , "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      , "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      , PRIMARY KEY (experiment_pk, sample_id)
    );
  END IF;
END;
$$
LANGUAGE plpgsql;