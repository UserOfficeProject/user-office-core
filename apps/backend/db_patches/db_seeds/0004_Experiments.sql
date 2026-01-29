DO
$DO$
DECLARE  
  exp_safety_review_template_category_id_var int;
  exp_safety_review_template_id_var int;
  exp_safety_review_template_topic_id_var int;
  instrument_id_1_var int;
  instrument_id_2_var int;
  experiment_workflow_id_var int;
  BEGIN
    -- Get instrument ids
    SELECT instrument_id INTO instrument_id_1_var FROM instruments WHERE name='Instrument 1' limit 1;
    SELECT instrument_id INTO instrument_id_2_var FROM instruments WHERE name='Instrument 2' limit 1;

INSERT INTO workflows(name, description, entity_type)
    VALUES ('Experiment Safety Review Workflow', 'Workflow for Experiment Safety Review', 'EXPERIMENT')
    RETURNING workflow_id INTO experiment_workflow_id_var;

    UPDATE call SET experiment_workflow_id = experiment_workflow_id_var;

    INSERT INTO workflow_has_statuses(workflow_id, status_id)
    VALUES (experiment_workflow_id_var, (SELECT status_id FROM statuses WHERE status_id='AWAITING_ESF'));

    INSERT INTO experiments(
      experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
      VALUES (996,'000001', 996, '2030-01-07 10:00:00', '2030-01-07 11:00:00', 1, 'ACTIVE', 1, instrument_id_1_var);

    INSERT INTO experiments(
    experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, instrument_id)
    VALUES (997, '000002', 997, '2020-01-07 10:00:00', '2020-01-07 11:00:00', 2, 'ACTIVE', instrument_id_2_var);

    INSERT INTO experiments(
    experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (998, '000003', 998, '2030-01-07 12:00:00', '2030-01-07 13:00:00', 1, 'DRAFT', 1, instrument_id_1_var);

    INSERT INTO experiments(
    experiment_pk, experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (999, '000004', 999, '2030-02-07 12:00:00', '2030-02-07 13:00:00', 1, 'COMPLETED', 1, instrument_id_2_var);
    
    -- Get Experiment Safety Review (ESR) Template category id, template id and topic id
    SELECT template_categories.template_category_id
      INTO exp_safety_review_template_category_id_var
      FROM template_categories
      WHERE name = 'Experiment Safety Review' limit 1;

    select templates.template_id
      INTO exp_safety_review_template_id_var
      from templates
      where group_id = 'EXPERIMENT_SAFETY_REVIEW_TEMPLATE' limit 1;
    
    select topics.topic_id 
      INTO exp_safety_review_template_topic_id_var
      from topics
      where template_id = exp_safety_review_template_id_var limit 1;

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
        'experiment_safety_review_boolean_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_boolean_question', exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 3, '{
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
        'experiment_safety_review_date_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_date_question', exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 4, '{ "tooltip": "","required": false,"small_label": "" , "readPermissions":[]}'
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
        'experiment_safety_review_interval_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_interval_question', exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 6, '{
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
        'experiment_safety_review_number_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_number_question', exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 7, '{
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
        'experiment_safety_review_rich_text_input_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_rich_text_input_question', exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 
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
        'experiment_safety_review_selection_from_options_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_selection_from_options_question', 
        exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 9, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true,"readPermissions":[]}'
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
        'experiment_safety_review_text_input_question', exp_safety_review_template_category_id_var
      );
    INSERT INTO templates_has_questions(
      question_id, template_id, topic_id, 
      sort_order, config
    ) 
    VALUES 
      (
        'experiment_safety_review_text_input_question', exp_safety_review_template_id_var, exp_safety_review_template_topic_id_var, 11, '{ "tooltip": "", "required": false, "small_label": "","readPermissions":[] }'
      );
  END;
$DO$
LANGUAGE plpgsql;
