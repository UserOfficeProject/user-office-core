DO
$$
BEGIN
    IF register_patch('0181_UpdateCallTablePdfTemplates.sql', 'Yoganandan Pandiyan', 'Rename pdf_template_id to proposal_pdf_template_id and add experiment_safety_pdf_template_id column', '2025-04-22') THEN

    -- Rename existing pdf_template_id to proposal_pdf_template_id
    ALTER TABLE call RENAME COLUMN pdf_template_id TO proposal_pdf_template_id;

    -- Add new column experiment_safety_pdf_template_id with same datatype and constraint
    ALTER TABLE call ADD COLUMN experiment_safety_pdf_template_id int REFERENCES templates(template_id);

    END IF;
END;
$$
LANGUAGE plpgsql;