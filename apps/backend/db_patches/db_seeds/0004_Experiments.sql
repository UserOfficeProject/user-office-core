DO
$DO$
  BEGIN

    INSERT INTO experiments(
      experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
      VALUES (996,'000001', 996, '2030-01-07 10:00:00', '2030-01-07 11:00:00', 1, 'ACTIVE', 1, 1);
   
    INSERT INTO experiments(
    experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, instrument_id)
    VALUES (997, '000002', 997, '2020-01-07 10:00:00', '2020-01-07 11:00:00', 1, 'ACTIVE', 1);

    INSERT INTO experiments(
    experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (998, '000003', 998, '2030-01-07 12:00:00', '2030-01-07 13:00:00', 1, 'DRAFT', 1, 2);

    INSERT INTO experiments(
    experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (999, '000004', 999, '2030-02-07 12:00:00', '2030-02-07 13:00:00', 1, 'COMPLETED', 1, 1);

      -- Insert Questions for Experiment Safety Review (ESR) Template
      -- BOOLEAN Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_boolean_question', 'BOOLEAN', 'Experiment Safety Review Boolean question from seeds', 
        '{
            "tooltip": "",
            "required": false,
            "small_label": "",
            "readPermissions":[]
            }', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_boolean_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_boolean_question', 4, 4, 3, '{
                "tooltip": "",
                "required": false,
                "small_label": "",
                "readPermissions":[]
            }'
      );

    -- Date Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_date_question', 'DATE', 'Experiment Safety Review Date question from seeds', 
        '{
            "tooltip": "",
            "required": false,
            "small_label": "",
            "readPermissions":[]
            }', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_date_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_date_question', 4, 4, 4, '{ "tooltip": "","required": false,"small_label": "" , "readPermissions":[]}'
      );

    -- INTERVAL Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_interval_question', 'INTERVAL', 
        'Experiment Safety Review Interval question from seeds', 
        '{
            "units": [
                {
                    "id": "meter",
                    "unit": "meter",
                    "symbol": "m",
                    "quantity": "length",
                    "siConversionFormula": "x"
                }
            ],
            "tooltip": "",
            "required": false,
            "small_label": "",
            "readPermissions":[]
            }', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_interval_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_interval_question', 4, 4, 6, '{
            "units": [
                {
                    "id": "meter",
                    "unit": "meter",
                    "symbol": "m",
                    "quantity": "length",
                    "siConversionFormula": "x"
                }
            ],
            "tooltip": "",
            "required": false,
            "small_label": "",
            "readPermissions":[]
          }'
      );
    -- NUMBER INPUT Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_number_question', 'NUMBER_INPUT', 
        'Experiment Safety Review Number question from seeds', '{
            "units": [
                {
                    "id": "meter",
                    "unit": "meter",
                    "symbol": "m",
                    "quantity": "length",
                    "siConversionFormula": "x"
                },
                {
                    "id": "centimeter",
                    "unit": "centimeter",
                    "symbol": "cm",
                    "quantity": "length",
                    "siConversionFormula": "x / 100"
                }
            ],
            "tooltip": "",
            "required": false,
            "small_label": "",
            "numberValueConstraint": null,
            "readPermissions": []
            }', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_number_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_number_question', 4, 4, 7, '{
            "units": [
                {
                    "id": "meter",
                    "unit": "meter",
                    "symbol": "m",
                    "quantity": "length",
                    "siConversionFormula": "x"
                },
                {
                    "id": "centimeter",
                    "unit": "centimeter",
                    "symbol": "cm",
                    "quantity": "length",
                    "siConversionFormula": "x / 100"
                }
            ],
            "tooltip": "",
            "required": false,
            "small_label": "",
            "numberValueConstraint": null,
            "readPermissions": []
          }'
      );
    -- Rich text input Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_rich_text_input_question', 'RICH_TEXT_INPUT', 
        'Experiment Safety Review Rich text input question from seeds', 
        '{ "tooltip": "","required": false,"small_label": "", "readPermissions": [] }', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_rich_text_input_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_rich_text_input_question', 4, 4, 
        8, '{ "tooltip": "", "required": false, "small_label": "", "readPermissions": [] }'
      );
    -- Selection from options Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_selection_from_options_question', 
        'SELECTION_FROM_OPTIONS', 'Experiment Safety Review Selection from options question from seeds', 
        '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true,"readPermissions":[]}', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_selection_from_options_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_selection_from_options_question', 
        4, 4, 9, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true,"readPermissions":[]}'
      );

    -- Text input Question for Experiment Safety Review (ESR) Template
    INSERT INTO questions(
      question_id, data_type, question, 
      default_config, created_at, updated_at, 
      natural_key, category_id
    ) 
    VALUES 
      (
        'experiment_safety_review_text_input_question', 'TEXT_INPUT', 
        'Experiment Safety Review Text input question from seeds', 
        '{ "tooltip": "","required": false,"small_label": "","readPermissions":[] }', 
        '2022-02-08 10:23:10.285415+00', 
        '2022-02-08 10:23:10.285415+00', 
        'experiment_safety_review_text_input_question', 12
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_text_input_question', 4, 4, 11, '{ "tooltip": "", "required": false, "small_label": "","readPermissions":[] }'
      );
  END;
$DO$
LANGUAGE plpgsql;
