DO
$$
BEGIN
    IF register_patch('Add_Experiment_Safety_Pdf_Template.sql', 'Yoganandan Pandiyan', 'Add experiment_safety_pdf_templates table with same structure as proposal_pdf_templates', '2025-04-22') THEN

    -- Create experiment_safety_pdf_templates table with the same structure as proposal_pdf_templates
    CREATE TABLE experiment_safety_pdf_templates (
        experiment_safety_pdf_template_id serial PRIMARY KEY,
        template_id integer REFERENCES templates(template_id) ON DELETE CASCADE,
        template_data text NOT NULL,
        template_header text NOT NULL,
        template_footer text NOT NULL,
        template_sample_declaration text NOT NULL,
        dummy_data text NOT NULL,
        creator_id integer REFERENCES users(user_id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT NOW()
    );

    END IF;
END;
$$
LANGUAGE plpgsql;