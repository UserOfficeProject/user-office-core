DO
$$
BEGIN
  IF register_patch('0161_AddStatusActionsLogsTables.sql', 'Farai Mutambara', 'Add Status Actions Logs', '2024-08-16') THEN
    BEGIN
       CREATE TABLE IF NOT EXISTS status_actions_logs(
            status_actions_log_id serial PRIMARY KEY,
            connection_id int NOT NULL,
            action_id int NOT NULL,
            status_actions_step text DEFAULT NULL,
            status_actions_by int REFERENCES users (user_id) ON UPDATE CASCADE,
            status_actions_successful boolean DEFAULT FALSE,
            status_actions_message text DEFAULT NULL,
            status_actions_tstamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
             FOREIGN KEY (connection_id, action_id) REFERENCES proposal_workflow_connection_has_actions (connection_id, action_id) ON UPDATE CASCADE ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS status_actions_log_has_proposals (
          status_actions_log_id int REFERENCES status_actions_logs (status_actions_log_id) ON UPDATE CASCADE ON DELETE CASCADE,
          proposal_pk int REFERENCES proposals(proposal_pk) ON UPDATE CASCADE ON DELETE CASCADE
        );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;