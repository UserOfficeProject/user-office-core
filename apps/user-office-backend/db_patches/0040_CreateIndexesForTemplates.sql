DO
$$
BEGIN
	IF register_patch('CreateIndexesForTemplates.sql', 'jekabskarklins', 'Adding indexes for performance', '2020-05-28') THEN
	BEGIN

		CREATE INDEX ON topic_completenesses( questionary_id );
		CREATE INDEX ON topics( template_id );
		CREATE INDEX ON answers( questionary_id );
		CREATE INDEX ON templates_has_questions( template_id );
		CREATE INDEX ON templates( category_id );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;