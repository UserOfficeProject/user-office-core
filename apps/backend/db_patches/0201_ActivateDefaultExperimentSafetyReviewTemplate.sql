DO
$$
DECLARE
    default_experiment_safety_review_template int;
    experiment_safety_review_template_group_id text;
BEGIN
    IF register_patch('ActivateDefaultExperimentSafetyReviewTemplate.sql', 'Yoganandan Pandiyan', 'Activate default Experiment Safety Review template', '2025-10-16') THEN
        SELECT templates.template_id, templates.group_id
        INTO default_experiment_safety_review_template, experiment_safety_review_template_group_id
        FROM templates 
        WHERE name='default experiment safety review template';

        INSERT INTO active_templates (template_id, group_id) VALUES (default_experiment_safety_review_template, experiment_safety_review_template_group_id);
    END IF;
END;
$$
LANGUAGE plpgsql;
