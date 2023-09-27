DO
$$
BEGIN
    IF register_patch('AddPdfTemplateAndLinkToCall.sql', 'Simon Fernandes', 'Create PDF template table and link it to call table', '2022-07-18') THEN

    INSERT INTO template_categories(template_category_id, name) VALUES(9, 'PDF template');
	
    INSERT INTO template_groups (template_group_id, category_id) VALUES('PDF_TEMPLATE', 9);
	
    CREATE TABLE IF NOT EXISTS "pdf_templates" (
      pdf_template_id serial PRIMARY KEY,
      template_id int REFERENCES templates (template_id) UNIQUE NOT NULL,
      template_data TEXT NOT NULL DEFAULT '',
      creator_id int REFERENCES users (user_id) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE call ADD COLUMN pdf_template_id int REFERENCES templates(template_id);

    END IF;
END;
$$
LANGUAGE plpgsql;
