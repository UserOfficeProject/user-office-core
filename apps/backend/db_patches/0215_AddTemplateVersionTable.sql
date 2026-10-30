DO
$$
BEGIN
	IF register_patch('AddTemplateVersionTable.sql', 'ellenwright', 'Add template version table', '2026-08-20') THEN

            CREATE TABLE IF NOT EXISTS template_versions(
            
            template_version_pk serial PRIMARY KEY,
            template_type VARCHAR(30) NOT NULL,
            template_id INT NOT NULL,
            version_number INT NOT NULL,
            template jsonb, 
            CONSTRAINT template_type_template_id UNIQUE(template_type, template_id, version_number),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

	END IF;
END;
$$
LANGUAGE plpgsql;