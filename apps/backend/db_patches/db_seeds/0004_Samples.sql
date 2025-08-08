DO
$DO$
BEGIN

  INSERT INTO public.templates(
	name, description, is_archived, group_id)
	VALUES ('default sample declaration template', 'default sample declaration template', false, 'SAMPLE');
	
INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('New sample', true, 0, 7);


INSERT INTO public.questionaries(
	template_id, created_at, creator_id)
	VALUES ( 7, '2021-07-20 13:59:08.597908+00', 2);

	-- BOOLEAN Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_boolean_question', 'BOOLEAN', 'Sample Boolean question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": "",
        "readPermissions":[]
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_boolean_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_boolean_question', 7, 7, 3, '{
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
    4, 'sample_boolean_question', '{"value": true }'
  );

-- Date Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_date_question', 'DATE', 'Sample Date question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": "",
        "readPermissions":[]
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_date_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_date_question', 7, 7, 4, '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_date_question', '{"value": "2030-01-01" }'
  );

-- File upload Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_file_upload_question', 'FILE_UPLOAD', 
    'Sample file upload question from seeds', 
    '{"tooltip": "", "required": false,"file_type": [".pdf",".doc",".docx"],"max_files": 0,"small_label": "", "readPermissions":[]}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_file_upload_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_file_upload_question', 7, 7, 5, '{"tooltip": "", "required": false,"file_type": [".pdf",".doc",".docx"],"max_files": 0,"small_label": "", "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_file_upload_question', '{
    "value": [{"id": "1c4b2ca8-f849-42db-b5d6-35aba2b26f8b"}]}'
  );
-- INTERVAL Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_interval_question', 'INTERVAL', 
    'Sample Interval question from seeds', 
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
        "readPermissions": []
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_interval_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_interval_question', 7, 7, 6, '{
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
        "readPermissions": []
      }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_interval_question', '{
    "value": {
        "max": 100,
        "min": 1,
        "siMax": 100,
        "siMin": 1
    }}'
  );
-- NUMBER INPUT Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_number_question', 'NUMBER_INPUT', 
    'Sample Number question from seeds', '{
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
    'sample_number_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_number_question', 7, 7, 7, '{
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
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_number_question', '{
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
-- Rich text input Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_rich_text_input_question', 'RICH_TEXT_INPUT', 
    'Sample Rich text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_rich_text_input_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_rich_text_input_question', 7, 7, 
    8, '{ "tooltip": "", "required": false, "small_label": "", "readPermissions": [] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_rich_text_input_question', '{"value": "<b>Rich text input value</b>" }'
  );
-- Selection from options Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_selection_from_options_question', 
    'SELECTION_FROM_OPTIONS', 'Sample Selection from options question from seeds', 
    '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true, "readPermissions":[]}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_selection_from_options_question', 
    2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_selection_from_options_question', 
    7, 7, 9, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true, "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_selection_from_options_question', 
    '{"value": ["One"] }'
  );

-- Dynamic multiple choice Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_dynamic_multiple_choice_question', 
    'DYNAMIC_MULTIPLE_CHOICE', 'Sample Dynamic multiple choice question from seeds', 
    '{"variant":"dropdown", "url":"", "jsonPath":"","isMultipleSelect":true, "apiCallRequestHeaders":[],  
      "readPermissions":[]}', 
    '2023-02-08 10:23:10.285415+00', 
    '2023-02-08 10:23:10.285415+00', 
    'sample_dynamic_multiple_choice_question', 
    2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_dynamic_multiple_choice_question', 
    7, 7, 10, '{"variant":"dropdown", "url":"", "jsonPath":"","isMultipleSelect":true, "apiCallRequestHeaders":[], 
      "readPermissions":[]}'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_dynamic_multiple_choice_question', 
    '{"value": ["One"] }'
  );

-- Text input Question for Sample Declaration Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_text_input_question', 'TEXT_INPUT', 
    'Sample Text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "", "readPermissions":[] }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_text_input_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_text_input_question', 7, 7, 11, '{ "tooltip": "", "required": false, "small_label": "", "readPermissions": [] }'
  );
INSERT INTO answers(
  questionary_id, question_id, answer
) 
VALUES 
  (
    4, 'sample_text_input_question', '{"value": "Text input answer from seeds" }'
  );
	
INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('sample_basis', 7, 7, 0, '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":"", "readPermissions":[]}', 'AND');
	
INSERT INTO public.questions(
	question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id)
	VALUES ('sample_declaration_question', 'SAMPLE_DECLARATION', 'Add samples', '{"addEntryButtonLabel":"Add","minEntries":null,"maxEntries":null,"templateId":7,"esiTemplateId":6,"templateCategory":"SAMPLE_DECLARATION","required":false,"small_label":"","readPermissions":[]}',
			'2021-07-20 13:53:29.246687+00', '2021-07-20 13:53:29.246687+00', 'sample_declaration_question', 1);
	
INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('Topic title', true, 1, 1);
	
INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('sample_declaration_question', 1, 8, 0, '{"addEntryButtonLabel":"Add","templateCategory":"SAMPLE_DECLARATION","templateId":7,"esiTemplateId":6,"small_label":"","required":false,"minEntries":null,"maxEntries":null, "readPermissions":[]}', 'AND');

INSERT INTO public.questionaries(
	template_id, created_at, creator_id)
	VALUES ( 7, '2021-07-20 13:59:08.597908+00', 2);
	
INSERT INTO public.samples(
	title, creator_id, questionary_id, safety_status, created_at, safety_comment, proposal_pk, question_id, shipment_id)
	VALUES ('My sample title', 2, 4, 0, '2021-07-20 13:59:08.602853+00', '', 1, 'sample_declaration_question', null);
	
INSERT INTO public.topic_completenesses(
	questionary_id, topic_id, is_complete)
	VALUES (4, 7, true);
	
INSERT INTO public.topic_completenesses(
	questionary_id, topic_id, is_complete)
	VALUES (3, 1, true);
	
INSERT INTO public.topic_completenesses(
	questionary_id, topic_id, is_complete)
	VALUES (3, 7, true);



END;
$DO$
LANGUAGE plpgsql;

