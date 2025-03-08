DO
$$
BEGIN
	IF register_patch('0170_MigrateSampleSafetyRoleInWorkflowActionEmail.sql', 'Yoganandan Pandiyan', 'Migrate the Role Sample Safety Reviewer to Experiment Safety Reviewer in the configured Workflow Email recepients', '2025-02-25') THEN
    BEGIN
      UPDATE proposal_workflow_connection_has_actions
      SET config = REPLACE(config::TEXT, '"SAMPLE_SAFETY"', '"EXPERIMENT_SAFETY_REVIEWERS"')::jsonb
      WHERE config::TEXT LIKE '%"SAMPLE_SAFETY"%';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;