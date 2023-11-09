DO
$$
DECLARE
  var_proposal_workflow_id INTEGER;
BEGIN
  IF register_patch('AddDefaultWorkflowToTheDefaultCall.sql', 'martintrajanovski', 'Adding default workflow and attaching it to a call because it is required valid call to have a workflow', '2023-08-23') THEN
    INSERT INTO proposal_workflows(name, description)
    VALUES('Default workflow', 'This is the default workflow')
    RETURNING proposal_workflow_id INTO var_proposal_workflow_id;

    INSERT INTO proposal_workflow_connections(proposal_workflow_id, proposal_status_id, next_proposal_status_id, prev_proposal_status_id, sort_order, droppable_group_id, parent_droppable_group_id)
    VALUES(var_proposal_workflow_id, 1, null, null, 0, 'proposalWorkflowConnections_0', null);

    UPDATE call
    SET proposal_workflow_id = var_proposal_workflow_id
    WHERE call_id = 1;
  END IF;
END;
$$
LANGUAGE plpgsql;
