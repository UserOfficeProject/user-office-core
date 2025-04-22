DO
$$
DECLARE
    technical_review_template_id_var int;
    technical_review_topic_id_var int;
    technical_review_loop_var int;
BEGIN
    IF register_patch('0180_AddTemplateGroups.sql', 'Yoganandan Pandiyan', 'Add new Template Groups', '2025-04-22') THEN

    INSERT INTO template_categories(template_category_id, name) VALUES(13, 'Experiment Safety PDF Template');

    INSERT INTO template_groups (template_group_id, category_id) VALUES('EXPERIMENT_SAFETY_PDF_TEMPLATE', 13);
	
    UPDATE template_categories SET name = 'Proposal PDF template' WHERE name = 'PDF template';

    -- First insert the new template group ID
    INSERT INTO template_groups (template_group_id, category_id) 
    SELECT 'PROPOSAL_PDF_TEMPLATE', category_id FROM template_groups WHERE template_group_id = 'PDF_TEMPLATE';
    
    -- Now update the references in the templates table
    UPDATE templates SET group_id = 'PROPOSAL_PDF_TEMPLATE' WHERE group_id = 'PDF_TEMPLATE';

    -- Finally, delete the old template group ID
    DELETE FROM template_groups WHERE template_group_id = 'PDF_TEMPLATE';

    END IF;
END;
$$
LANGUAGE plpgsql;
