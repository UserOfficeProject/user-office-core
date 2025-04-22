DO
$$
BEGIN
    IF register_patch('0182_Rename_Pdf_Template.sql', 'Yoganandan Pandiyan', 'Rename pdf_templates table to proposal_pdf_templates', '2025-04-22') THEN

    -- Rename the table
    ALTER TABLE pdf_templates RENAME TO proposal_pdf_templates;
    
    -- Rename the primary key column
    ALTER TABLE proposal_pdf_templates RENAME COLUMN pdf_template_id TO proposal_pdf_template_id;

    END IF;
END;
$$
LANGUAGE plpgsql;