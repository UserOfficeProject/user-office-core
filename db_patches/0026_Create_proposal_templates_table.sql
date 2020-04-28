DO
$$
BEGIN
	IF register_patch('Create_proposal_templates_table.sql', 'jekabskarklins', 'Creating questionaries table', '2020-03-30') THEN
	BEGIN



    CREATE TABLE IF NOT EXISTS proposal_templates(
    template_id SERIAL PRIMARY KEY
    , name VARCHAR(200) NOT NULL
    , description TEXT NULL
    , is_archived BOOLEAN DEFAULT FALSE);

	INSERT INTO 
        proposal_templates(name, description, is_archived)
    VALUES 
        ('default template', 'original template', false);




 
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;