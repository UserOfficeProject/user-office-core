DO
$$
BEGIN
    IF register_patch('Rename_Pdf_Template.sql', 'Yoganandan Pandiyan', 'Rename pdf_templates table to proposal_pdf_templates', '2025-04-22') THEN

    -- Rename the table
    ALTER TABLE pdf_templates RENAME TO proposal_pdf_templates;
    
    -- Rename the primary key column
    ALTER TABLE proposal_pdf_templates RENAME COLUMN pdf_template_id TO proposal_pdf_template_id;

    -- Drop the old foreign key constraint if it exists
    ALTER TABLE proposal_pdf_templates DROP CONSTRAINT IF EXISTS pdf_templates_template_id_fkey;

    -- Add the new foreign key constraint with ON DELETE CASCADE
    ALTER TABLE proposal_pdf_templates
    ADD CONSTRAINT proposal_pdf_templates_template_id_fkey
    FOREIGN KEY (template_id)
    REFERENCES templates(template_id)
    ON DELETE CASCADE;

    END IF;
END;
$$
LANGUAGE plpgsql;