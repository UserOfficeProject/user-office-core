DO
$$
BEGIN
	IF register_patch('AlterQuestionsAddColumnCategory.sql', 'jekabskarklins', 'Adding category ID to questions', '2020-06-11') THEN
	BEGIN

    ALTER TABLE questions 
    ADD COLUMN category_id INT NOT NULL REFERENCES template_categories(template_category_id) DEFAULT 1;

    ALTER TABLE questions ALTER COLUMN category_id DROP DEFAULT;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;