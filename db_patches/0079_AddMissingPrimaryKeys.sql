DO
$$
BEGIN
    IF register_patch('AddMissingPrimaryKeys.sql', 'Peter Asztalos', 'Add missing Primary keys', '2021-02-11') THEN

      ALTER TABLE technical_review ADD PRIMARY KEY (technical_review_id);
      ALTER TABLE technical_review DROP CONSTRAINT technical_review_technical_review_id_key;
      ALTER TABLE nationalities ADD PRIMARY KEY (nationality_id);
      ALTER TABLE institutions ADD PRIMARY KEY (institution_id);
      ALTER TABLE countries ADD PRIMARY KEY (country_id);
      ALTER TABLE shipments_has_samples ADD PRIMARY KEY (shipment_id, sample_id);
      ALTER TABLE questions_has_template ADD PRIMARY KEY (template_id, question_id);
      ALTER TABLE active_templates ADD PRIMARY KEY (category_id, template_id);
      ALTER TABLE active_templates DROP CONSTRAINT active_templates_category_id_key;

    END IF;
END;
$$
LANGUAGE plpgsql;