DO
$$
BEGIN
	IF register_patch('NullifyActiveTemplateReferences.sql', 'Jekabs Karklins', 'Nullify references to active template', '2022-05-20') THEN

        ALTER TABLE active_templates
        DROP CONSTRAINT active_templates_template_id_fkey;

        ALTER TABLE active_templates
        ADD CONSTRAINT active_templates_template_id_fkey
            FOREIGN KEY (template_id)
            REFERENCES templates(template_id)
            ON DELETE CASCADE;
        

	END IF;
END;
$$
LANGUAGE plpgsql;