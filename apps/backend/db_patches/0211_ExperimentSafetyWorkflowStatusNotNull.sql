DO
$$
DECLARE
    v_updated BIGINT := 0;
BEGIN
    IF register_patch(
       'ExperimentSafetyWorkflowStatusNotNull',
       'Yoganandan Pandiyan',
       'Make experiment_safety.workflow_status_id NOT NULL after backfilling with AWAITING_ESF status from experiment workflow.',
       '2026-05-29'
     ) THEN

        -- Backfill existing experiment_safety rows that have NULL workflow_status_id.
        -- Chain: experiment_safety → experiments (experiment_pk) → proposals (proposal_pk)
        --        → call (call_id) → call.experiment_workflow_id → workflow_has_statuses
        --        (where status_id = 'AWAITING_ESF')
        --
        -- NOTE: If a call has no experiment_workflow_id assigned, those rows are skipped.
        -- This means experiment_safety rows linked to such calls will retain NULL
        -- workflow_status_id, which will cause an error when SET NOT NULL is applied.
        UPDATE experiment_safety es
        SET workflow_status_id = whs.workflow_status_id
        FROM experiments e
        JOIN proposals p ON p.proposal_pk = e.proposal_pk
        JOIN call c ON c.call_id = p.call_id
        JOIN workflow_has_statuses whs
          ON whs.workflow_id = c.experiment_workflow_id
         AND whs.status_id = 'AWAITING_ESF'
        WHERE es.experiment_pk = e.experiment_pk
          AND es.workflow_status_id IS NULL
          AND c.experiment_workflow_id IS NOT NULL;

        GET DIAGNOSTICS v_updated = ROW_COUNT;

        IF v_updated = 0 THEN
          RAISE NOTICE 'No experiment_safety rows required workflow_status_id backfill.';
        ELSE
          RAISE NOTICE USING MESSAGE = format('%s experiment_safety rows updated with AWAITING_ESF workflow_status_id.', v_updated);
        END IF;

        -- Make the column non-nullable now that existing rows have been backfilled
        ALTER TABLE experiment_safety ALTER COLUMN workflow_status_id SET NOT NULL;

    END IF;
END;
$$
LANGUAGE plpgsql;
