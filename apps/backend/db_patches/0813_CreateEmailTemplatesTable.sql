DO
$$
BEGIN
	IF register_patch('CreateEmailTemplatesTable.sql', 'Gergely Nyiri', 'Create emails table', '2025-07-15') THEN
	BEGIN

      CREATE TABLE IF NOT EXISTS email_templates (
            email_template_id serial PRIMARY KEY,
            created_by INT NOT NULL REFERENCES users(user_id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            name varchar(100) NOT NULL UNIQUE,
            description varchar(255) NOT NULL, 
            subject varchar(160) NOT NULL, 
            body text
      ); 

      -- ALTER TABLE workflow_connection_has_actions ADD COLUMN email_template_id INT;
      -- ALTER TABLE workflow_connection_has_actions ADD CONSTRAINT workflow_connection_has_actions_email_template_id_fk 
      --       FOREIGN KEY (email_template_id) REFERENCES email_templates(email_template_id)
      --       ON DELETE CASCADE;
      
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;