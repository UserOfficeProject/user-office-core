DO $$
BEGIN
  IF register_patch(
       'MigrateWorkflows',
       'Jekabs',
       'Migrate workflows',
       '2025-07-16'
     ) THEN

    -- Backfill: 
    -- same workflow connection group (earlier sort_order) first; 
    -- else parent connection group (largest sort_order)
    WITH resolved AS (
      SELECT
        c.workflow_connection_id,
        (
          SELECT p.workflow_connection_id
          FROM public.workflow_connections p
          WHERE p.workflow_id = c.workflow_id
            AND p.droppable_group_id = c.droppable_group_id
            AND p.status_id = c.prev_status_id
            AND p.sort_order < c.sort_order
          ORDER BY p.sort_order DESC
          LIMIT 1
        ) AS same_prev_id,
        (
          SELECT q.workflow_connection_id
          FROM public.workflow_connections q
          WHERE q.workflow_id = c.workflow_id
            AND q.droppable_group_id = c.parent_droppable_group_id
            AND q.status_id = c.prev_status_id
          ORDER BY q.sort_order DESC
          LIMIT 1
        ) AS parent_prev_id
      FROM public.workflow_connections c
      WHERE c.prev_status_id IS NOT NULL
    )
    UPDATE public.workflow_connections wc
    SET prev_connection_id = COALESCE(resolved.same_prev_id, resolved.parent_prev_id)
    FROM resolved
    WHERE wc.workflow_connection_id = resolved.workflow_connection_id;

    -- Add FK (ignore if it already exists)
    BEGIN
      ALTER TABLE public.workflow_connections
        ADD CONSTRAINT workflow_connections_prev_connection_id_fkey
        FOREIGN KEY (prev_connection_id)
        REFERENCES public.workflow_connections (workflow_connection_id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      -- constraint already exists; ignore
      NULL;
    END;

  END IF;
END;
$$ LANGUAGE plpgsql;
