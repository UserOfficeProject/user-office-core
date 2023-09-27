DO
$$
BEGIN
	IF register_patch('Alter_calls.sql', 'jekabskarklins', 'Adding template id to call', '2020-03-30') THEN
	BEGIN



    ALTER table call
	ADD COLUMN template_id INTEGER REFERENCES proposal_templates(template_id) DEFAULT 1;
	
	
	ALTER TABLE call ALTER COLUMN template_id DROP DEFAULT;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;