DO
$$
BEGIN
  IF register_patch('RemoveWorkflowUnusedColumns', 'Jekabs', 'Remove Workflow Unused Columns', '2025-07-16') THEN
    BEGIN
      ALTER TABLE workflow_connections DROP COLUMN IF EXISTS droppable_group_id;
      ALTER TABLE workflow_connections DROP COLUMN IF EXISTS parent_droppable_group_id;
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS pos_x INTEGER;
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS pos_y INTEGER;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
