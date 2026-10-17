DO
$$
BEGIN
	IF register_patch('AddVersionToTemplates.sql', 'ellenwright', 'Add versions to templates', '2026-08-20') THEN

            CREATE TABLE IF NOT EXISTS template_versions(
            template_version_id serial PRIMARY KEY,
            template_id INT,
            template jsonb, 
            version_number INT,
            template_type VARCHAR(30),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

	END IF;
END;
$$
LANGUAGE plpgsql;