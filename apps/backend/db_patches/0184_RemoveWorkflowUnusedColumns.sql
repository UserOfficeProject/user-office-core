DO
$$
BEGIN
  IF register_patch('RemoveWorkflowUnusedColumns', 'Jekabs', 'Remove Workflow Unused Columns and Add Connection Line Type', '2025-07-16') THEN
    BEGIN
      -- Remove unused columns from workflow_connections
      -- ALTER TABLE workflow_connections DROP COLUMN IF EXISTS droppable_group_id;
      -- ALTER TABLE workflow_connections DROP COLUMN IF EXISTS parent_droppable_group_id;
      
      -- Add position columns to workflow_connections
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS pos_x INTEGER DEFAULT 0;
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS pos_y INTEGER DEFAULT 0;
      
      -- Add connection line type column to workflows table
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS connection_line_type VARCHAR(50) DEFAULT 'default';

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
