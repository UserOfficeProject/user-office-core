DO
$$
BEGIN
	IF register_patch('CreateEmailTemplatesTable.sql', 'Gergely Nyiri', 'Create email templates table', '2025-07-15') THEN
            CREATE TABLE IF NOT EXISTS email_templates (
                  email_template_id serial PRIMARY KEY,
                  created_by INT NOT NULL REFERENCES users(user_id),
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  name varchar(100) NOT NULL UNIQUE,
                  description varchar(255) NOT NULL,
                  use_template_file boolean DEFAULT FALSE,
                  subject varchar(160), 
                  body text
            ); 
      END IF;
END;
$$
LANGUAGE plpgsql;