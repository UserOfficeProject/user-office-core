DO
$$
BEGIN
	-- Change AddExperimentWorkflowToCall to 0179_AddExperimentWorkflowToCall
	IF register_patch('AddExperimentWorkflowToCall.sql', 'Yoganandan Pandiyan', 'Add experiment_workflow_id to call table', '2025-07-28') THEN
	  BEGIN
      ALTER table call
	      ADD COLUMN experiment_workflow_id INTEGER REFERENCES workflows(workflow_id) DEFAULT null;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;