DO
$DO$
DECLARE
  proposal_template_id_var INT;
  proposal_topic_id_var INT;
  proposal_category_id_var INT;
  proposal_questionary_id_var INT;
BEGIN
-- Get Proposal Template category id
SELECT template_category_id INTO proposal_category_id_var FROM template_categories WHERE name = 'Proposal' LIMIT 1;

-- Get Proposal Template id
SELECT template_id INTO proposal_template_id_var FROM templates WHERE name = 'default template' LIMIT 1;

-- Get Proposal Template topic id
SELECT topic_id INTO proposal_topic_id_var FROM topics WHERE template_id = proposal_template_id_var and topic_title = 'Topic title' LIMIT 1;

-- Create a questionary for proposal
SELECT questionary_id INTO proposal_questionary_id_var FROM questionaries WHERE template_id = proposal_template_id_var LIMIT 1;
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
        "small_label": "",
        "readPermissions":[]
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'boolean_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'boolean_question', proposal_template_id_var, proposal_topic_id_var, 3, '{
            "tooltip": "",
            "required": false,
            "small_label": "",
            "readPermissions":[]
        }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'boolean_question', '{"value": true }'
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
        "small_label": "",
        "readPermissions":[]
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'date_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'date_question', proposal_template_id_var, proposal_topic_id_var, 5, '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'date_question', '{"value": "2030-01-01" }'
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
    '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'embellishment_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'embellishment_question', proposal_template_id_var, proposal_topic_id_var, 9, 
    '{ "tooltip": "", "required": false, "small_label": "", "readPermissions":[] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'embellishment_question', '{"value": "<h1>Embellishment value<h1>" }'
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
    '{"tooltip": "", "required": false,"file_type": [".pdf",".doc",".docx"],"max_files": 0,"small_label": "", "readPermissions":[]}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'file_upload_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'file_upload_question', proposal_template_id_var, proposal_topic_id_var, 8, '{"tooltip": "", "required": false,"file_type": [".pdf",".doc",".docx"],"max_files": 0,"small_label": "", "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'file_upload_question', '{
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
        "small_label": "", 
        "readPermissions":[]
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'interval_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'interval_question', proposal_template_id_var, proposal_topic_id_var, 4, '{
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
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'interval_question', '{
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
        "numberValueConstraint": null,
        "readPermissions":[]
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'number_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'number_question', proposal_template_id_var, proposal_topic_id_var, proposal_questionary_id_var, '{
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
        "readPermissions":[]
      }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'number_question', '{
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
    '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'rich_text_input_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'rich_text_input_question', proposal_template_id_var, proposal_topic_id_var, 
    8, '{ "tooltip": "", "required": false, "small_label": "", "readPermissions":[] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'rich_text_input_question', '{"value": "<b>Rich text input value</b>" }'
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
    '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true, "readPermissions":[]}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'selection_from_options_question', 
    proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'selection_from_options_question', 
    proposal_template_id_var, proposal_topic_id_var, 6, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true, "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'selection_from_options_question', 
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
    '{"variant":"dropdown", "url":"", "jsonPath":"","isMultipleSelect":true, "apiCallRequestHeaders":[], "readPermissions":[]}', 
    '2023-02-08 10:23:10.285415+00', 
    '2023-02-08 10:23:10.285415+00', 
    'dynamic_multiple_choice_question', 
    proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'dynamic_multiple_choice_question', 
    proposal_template_id_var, proposal_topic_id_var, 6, '{"variant":"dropdown", "url":"", "jsonPath":"","isMultipleSelect":true, "apiCallRequestHeaders":[],"readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'dynamic_multiple_choice_question', 
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
    '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'text_input_question', proposal_category_id_var
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'text_input_question', proposal_template_id_var, proposal_topic_id_var, 7, '{ "tooltip": "", "required": false, "small_label": "", "readPermissions":[] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'text_input_question', '{"value": "Text input answer from seeds" }'
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
    '{"variant":"dropdown","options":[1, 2],"readPermissions":[]}', 
    '2023-02-08 10:23:10.285415+00', 
    '2023-02-08 10:23:10.285415+00', 
    'instrument_picker_question', 
    proposal_category_id_var
  );

INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'instrument_picker_question', 
    proposal_template_id_var, proposal_topic_id_var, 6, '{"variant":"dropdown","options":[1, 2], "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'instrument_picker_question', 
    '{"value": 1 }'
  );

-- Technique picker
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'technique_picker_question', 
    'TECHNIQUE_PICKER', 'Technique Picker question from seeds', 
    '{"variant":"dropdown","options":[1, 2], "readPermissions":[]}', 
    '2024-06-08 10:23:10.285415+00', 
    '2024-06-08 10:23:10.285415+00', 
    'technique_picker_question', 
    proposal_category_id_var
  );

INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'technique_picker_question', 
    proposal_template_id_var, proposal_topic_id_var, 6, '{"variant":"dropdown","options":[1, 2], "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    proposal_questionary_id_var, 'technique_picker_question', 
    '{"value": 1 }'
  );


END;
$DO$
LANGUAGE plpgsql;
