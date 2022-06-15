DO
$$
BEGIN
	IF register_patch('AddProposalWorkflowToCall.sql', 'martintrajanovski', 'Add proposal_workflow_id to call table', '2020-10-09') THEN
	  BEGIN
      ALTER table call
	      ADD COLUMN proposal_workflow_id INTEGER REFERENCES proposal_workflows(proposal_workflow_id) DEFAULT null;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;