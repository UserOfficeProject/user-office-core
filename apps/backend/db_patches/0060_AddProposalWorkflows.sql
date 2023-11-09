

DO
$$
BEGIN
	IF register_patch('AddProposalWorkflows.sql', 'martintrajanovski', 'Add proposals workflows and connections tables', '2020-09-14') THEN
    BEGIN
        CREATE TABLE IF NOT EXISTS proposal_workflows (
            proposal_workflow_id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(200) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS proposal_workflow_connections (
            proposal_workflow_connection_id SERIAL PRIMARY KEY,
            proposal_workflow_id INT REFERENCES proposal_workflows (proposal_workflow_id) ON DELETE CASCADE NOT NULL,
            proposal_status_id INT REFERENCES proposal_statuses (proposal_status_id) ON DELETE CASCADE NOT NULL,
            next_proposal_status_id INT REFERENCES proposal_statuses (proposal_status_id) ON DELETE CASCADE,
            prev_proposal_status_id INT REFERENCES proposal_statuses (proposal_status_id) ON DELETE CASCADE,
            next_status_event_type VARCHAR(50) NOT NULL
        );
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;