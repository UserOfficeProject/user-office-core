DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('CreateFeedbackDataStructures.sql', 'jekabskarklins', 'Create feedback data structures', '2021-11-16') THEN
	BEGIN

      CREATE TABLE feedbacks (
            feedback_id serial PRIMARY KEY
          , scheduled_event_id INT NOT NULL REFERENCES scheduled_events(scheduled_event_id)
          , status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED')) DEFAULT 'DRAFT' 
          , questionary_id INT NOT NULL REFERENCES questionaries(questionary_id)
          , creator_id INT NOT NULL REFERENCES users (user_id)
          , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          , submitted_at TIMESTAMPTZ DEFAULT NULL
      ); 

      INSERT INTO template_categories(template_category_id, name) VALUES(8, 'Feedback');

      INSERT INTO question_datatypes(question_datatype_id) VALUES('FEEDBACK_BASIS');

      INSERT INTO questions(
              question_id,
              data_type,
              question,
              default_config,
              natural_key,
              category_id
          )
      VALUES(
                'feedback_basis'
              , 'FEEDBACK_BASIS'
              , 'Feedback basic information'
              , '{"required":false,"small_label":"","tooltip":""}'
              , 'feedback_basis'
              , 8
          );

      INSERT INTO template_groups (template_group_id, category_id)
        VALUES
            ('FEEDBACK', 8);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;