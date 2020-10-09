DO
$$
BEGIN
	IF register_patch('ProposalWorkflowHasCalls.sql', 'martintrajanovski', 'proposal_workflow_has_calls table creation', '2020-10-09') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "proposal_workflow_has_calls" (
      proposal_workflow_id INT REFERENCES proposal_workflows (proposal_workflow_id) ON UPDATE CASCADE,
      call_id INT REFERENCES call (call_id) ON UPDATE CASCADE,
      CONSTRAINT proposal_workflow_has_calls_pkey PRIMARY KEY (proposal_workflow_id, call_id)  -- explicit pk
    );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;