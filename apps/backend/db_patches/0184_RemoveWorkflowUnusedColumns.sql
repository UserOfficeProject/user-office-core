DO
$$
BEGIN
  IF register_patch('RemoveWorkflowUnusedColumns', 'Jekabs', 'Remove Workflow Unused Columns', '2025-07-16') THEN
    BEGIN
      ALTER TABLE workflow_connections DROP COLUMN IF EXISTS droppable_group_id;
      ALTER TABLE workflow_connections DROP COLUMN IF EXISTS parent_droppable_group_id;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
