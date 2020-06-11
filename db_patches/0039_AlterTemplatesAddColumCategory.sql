DO
$$
BEGIN
	IF register_patch('AlterTemplatesAddColumCategory.sql', 'jekabskarklins', 'Adding category ID to templates', '2020-06-09') THEN
	BEGIN


    INSERT INTO template_categories(name) VALUES('Proposal');
    INSERT INTO template_categories(name) VALUES('Sample declaration');

    ALTER TABLE templates 
    ADD COLUMN category_id INT NOT NULL REFERENCES template_categories(template_category_id) DEFAULT 1;

    ALTER TABLE templates ALTER COLUMN category_id DROP DEFAULT;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;