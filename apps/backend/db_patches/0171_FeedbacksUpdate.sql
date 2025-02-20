DO
$$
BEGIN
  IF register_patch('0171_FeedbacksUpdate', 'Yoganandan Pandiyan', 'Updating the Feedbacks to refer to the new Experiments table', '2025-02-13') THEN
    ALTER TABLE feedbacks
    ADD COLUMN experiment_pk INT NOT NULL REFERENCES experiments(experiment_pk);

    ALTER TABLE feedbacks DROP COLUMN scheduled_event_id;

    ALTER TABLE feedback_requests 
    ADD COLUMN experiment_pk INT NOT NULL REFERENCES experiments(experiment_pk);

    ALTER TABLE feedback_requests DROP COLUMN scheduled_event_id;
  END IF;
END;
$$
LANGUAGE plpgsql;