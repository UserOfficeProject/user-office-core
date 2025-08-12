DO
$$
BEGIN
  IF register_patch('Add new workflow columns', 'Jekabs', 'Add position and prev_connection_id columns to workflow_connections', '2025-07-16') THEN
    BEGIN
      -- Allow these to be nullable. We will drop the columns later as they are not used anymore.
      ALTER TABLE public.workflow_connections
      ALTER COLUMN droppable_group_id DROP NOT NULL;

      ALTER TABLE public.workflow_connections
      ALTER COLUMN parent_droppable_group_id DROP NOT NULL;

      
      -- Add position and prev_connection_id columns to workflow_connections
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS pos_x INTEGER DEFAULT 0;
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS pos_y INTEGER DEFAULT 0;
      ALTER TABLE workflow_connections ADD COLUMN IF NOT EXISTS prev_connection_id INTEGER DEFAULT NULL 
        REFERENCES workflow_connections(workflow_connection_id) 
        ON DELETE SET NULL;

      -- Add connection line type column to workflows table
      ALTER TABLE workflows ADD COLUMN IF NOT EXISTS connection_line_type VARCHAR(50) DEFAULT 'default';

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
