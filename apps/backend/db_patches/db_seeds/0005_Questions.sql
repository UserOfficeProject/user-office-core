DO
$DO$
BEGIN




-- BOOLEAN
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'boolean_question', 'BOOLEAN', 'Boolean question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'boolean_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'boolean_question', 1, 6, 3, '{
            "tooltip": "",
            "required": false,
            "small_label": ""
        }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'boolean_question', '{"value": true }'
  );
-- Date
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'date_question', 'DATE', 'Date question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'date_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'date_question', 1, 6, 5, '{ "tooltip": "","required": false,"small_label": "" }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'date_question', '{"value": "2030-01-01" }'
  );
-- Embellishment
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'embellishment_question', 'EMBELLISHMENT', 
    'Embellishment question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'embellishment_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'embellishment_question', 1, 6, 9, 
    '{ "tooltip": "", "required": false, "small_label": "" }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'embellishment_question', '{"value": "<h1>Embellishment value<h1>" }'
  );
-- File upload
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'file_upload_question', 'FILE_UPLOAD', 
    'File upload question from seeds', 
    '{"tooltip": "", "required": false,"file_type": [".pdf",".doc",".docx"],"max_files": 0,"small_label": ""}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'file_upload_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'file_upload_question', 1, 6, 8, '{"tooltip": "", "required": false,"file_type": [".pdf",".doc",".docx"],"max_files": 0,"small_label": ""}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'file_upload_question', '{
    "value": [{"id": "1c4b2ca8-f849-42db-b5d6-35aba2b26f8b"}]}'
  );
-- INTERVAL
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'interval_question', 'INTERVAL', 
    'Interval question from seeds', 
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
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'interval_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'interval_question', 1, 6, 4, '{
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
        "small_label": ""
      }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'interval_question', '{
    "value": {
        "max": 100,
        "min": 1,
        "siMax": 100,
        "siMin": 1
    }}'
  );
-- NUMBER INPUT
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'number_question', 'NUMBER_INPUT', 
    'Number question from seeds', '{
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
        "numberValueConstraint": null
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'number_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'number_question', 1, 6, 2, '{
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
        "numberValueConstraint": null
      }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'number_question', '{
    "value": {
        "unit": {
            "id": "centimeter",
            "unit": "centimeter",
            "symbol": "cm",
            "quantity": "length",
            "siConversionFormula": "x / 100"
        },
        "value": 99,
        "siValue": 0.99
    }
}'
  );
-- Rich text input
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'rich_text_input_question', 'RICH_TEXT_INPUT', 
    'Rich text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'rich_text_input_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'rich_text_input_question', 1, 6, 
    8, '{ "tooltip": "", "required": false, "small_label": "" }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'rich_text_input_question', '{"value": "<b>Rich text input value</b>" }'
  );
-- Selection from options
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'selection_from_options_question', 
    'SELECTION_FROM_OPTIONS', 'Selection from options question from seeds', 
    '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'selection_from_options_question', 
    1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'selection_from_options_question', 
    1, 6, 6, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'selection_from_options_question', 
    '{"value": ["One"] }'
  );

-- Dynamic multiple choice
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'dynamic_multiple_choice_question', 
    'DYNAMIC_MULTIPLE_CHOICE', 'Dynamic multiple choice question from seeds', 
    '{"variant":"dropdown", "url":"", "jsonPath":"","isMultipleSelect":true, "apiCallRequestHeaders":[]}', 
    '2023-02-08 10:23:10.285415+00', 
    '2023-02-08 10:23:10.285415+00', 
    'dynamic_multiple_choice_question', 
    1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'dynamic_multiple_choice_question', 
    1, 6, 6, '{"variant":"dropdown", "url":"", "jsonPath":"","isMultipleSelect":true, "apiCallRequestHeaders":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'dynamic_multiple_choice_question', 
    '{"value": ["One"] }'
  );

-- Text input
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'text_input_question', 'TEXT_INPUT', 
    'Text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'text_input_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'text_input_question', 1, 6, 7, '{ "tooltip": "", "required": false, "small_label": "" }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'text_input_question', '{"value": "Text input answer from seeds" }'
  );


-- Instrument picker
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'instrument_picker_question', 
    'INSTRUMENT_PICKER', 'Instrument Picker question from seeds', 
    '{"variant":"dropdown","options":[1, 2]}', 
    '2023-02-08 10:23:10.285415+00', 
    '2023-02-08 10:23:10.285415+00', 
    'instrument_picker_question', 
    1
  );

INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'instrument_picker_question', 
    1, 6, 6, '{"variant":"dropdown","options":[1, 2]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    2, 'instrument_picker_question', 
    '{"value": 1 }'
  );



END;
$DO$
LANGUAGE plpgsql;
