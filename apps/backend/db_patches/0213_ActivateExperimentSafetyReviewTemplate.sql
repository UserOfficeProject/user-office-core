DO
$$
DECLARE
    exp_safety_review_template_id_var int;
BEGIN
    IF register_patch(
       'ActivateExperimentSafetyReviewTemplate.sql',
       'Yoganandan Pandiyan',
       'Mark an experiment safety review template as active when none is active.',
       '2026-06-08'
     ) THEN

        SELECT template_id
        INTO exp_safety_review_template_id_var
        FROM templates
        WHERE group_id = 'EXPERIMENT_SAFETY_REVIEW_TEMPLATE'
          AND NOT EXISTS (
              SELECT 1
              FROM active_templates
              WHERE group_id = 'EXPERIMENT_SAFETY_REVIEW_TEMPLATE'
          )
        ORDER BY template_id
        LIMIT 1;

        IF exp_safety_review_template_id_var IS NOT NULL THEN
            INSERT INTO active_templates(group_id, template_id)
            VALUES (
                'EXPERIMENT_SAFETY_REVIEW_TEMPLATE',
                exp_safety_review_template_id_var
            )
            ON CONFLICT (group_id) DO NOTHING;
        END IF;

    END IF;
END;
$$
LANGUAGE plpgsql;
