DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('CreateShipmentsTable.sql', 'jekabskarklins', 'Create shipments table', '2021-01-11') THEN
	BEGIN

      CREATE TABLE shipments (
            shipment_id serial PRIMARY KEY
          , title VARCHAR(500) NOT NULL DEFAULT ''
          , proposal_id int REFERENCES proposals(proposal_id) ON DELETE CASCADE
          , status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED')) DEFAULT 'DRAFT' 
          , external_ref VARCHAR(200) DEFAULT NULL
          , questionary_id int REFERENCES questionaries(questionary_id)
          , creator_id int REFERENCES users (user_id)
          , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ); 

      ALTER TABLE samples 
      ADD COLUMN shipment_id INT REFERENCES template_categories(template_category_id) DEFAULT NULL;

      INSERT INTO template_categories(name) VALUES('Shipment declaration');

      SELECT template_categories.template_category_id 
      INTO shipmentCategoryId
      FROM template_categories 
      WHERE name='Shipment declaration'; -- store the category ID for the Shipment declaration

      INSERT INTO question_datatypes(question_datatype_id) VALUES('SHIPMENT_BASIS');

    INSERT INTO questions(
            question_id,
            data_type,
            question,
            default_config,
            natural_key,
            category_id
        )
    VALUES(
              'shipment_basis'
            , 'SHIPMENT_BASIS'
            , 'Shipment basic information'
            , '{"required":false,"small_label":"","tooltip":""}'
            , 'shipment_basis'
            , shipmentCategoryId
        );

      CREATE TABLE active_templates (
            category_id INT NOT NULL REFERENCES template_categories(template_category_id) UNIQUE
          , template_id INT NOT NULL REFERENCES templates(template_id)
      ); 

      CREATE TABLE shipments_has_samples (
            shipment_id INT NOT NULL REFERENCES shipments(shipment_id) ON DELETE CASCADE
          , sample_id INT NOT NULL REFERENCES samples(sample_id) ON DELETE CASCADE
      ); 
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;