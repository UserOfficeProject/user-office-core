DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('AddVisitationTemplate.sql', 'jekabskarklins', 'Add visitation template', '2021-05-11') THEN

        
      CREATE TABLE visitations (
        visitation_id serial PRIMARY KEY
        , proposal_id int REFERENCES proposals(proposal_id) ON DELETE CASCADE
        , status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'ACCEPTED')) DEFAULT 'DRAFT' 
        , questionary_id int REFERENCES questionaries(questionary_id)
        , visitor_id int REFERENCES users (user_id)
        , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ); 

      INSERT INTO template_categories(name) VALUES('Visitation');

      INSERT INTO question_datatypes(question_datatype_id) VALUES('VISITATION_BASIS');

      SELECT template_categories.template_category_id 
      INTO shipmentCategoryId
      FROM template_categories 
      WHERE name='Visitation';

        INSERT INTO questions(
                question_id,
                data_type,
                question,
                default_config,
                natural_key,
                category_id
            )
        VALUES(
                'visitation_basis'
                , 'VISITATION_BASIS'
                , 'Visitation basic information'
                , '{"required":false,"small_label":"","tooltip":""}'
                , 'visitation_basis'
                , shipmentCategoryId
            );

        CREATE TABLE visitations_has_users (
              visitation_id int REFERENCES visitations (visitation_id) ON DELETE CASCADE
            , user_id int REFERENCES users (user_id) ON DELETE CASCADE
        ); 

	END IF;
END;
$$
LANGUAGE plpgsql;