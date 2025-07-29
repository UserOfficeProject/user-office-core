DO
$DO$
DECLARE 
	proposal_esi_template_id INTEGER;
	proposal_esi_template_topic_id INTEGER;
	sample_esi_template_id INTEGER;
	sample_esi_template_topic_id INTEGER;
BEGIN

	INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('default esi template', 'default esi template', false, 'PROPOSAL_ESI') 
	RETURNING template_id INTO proposal_esi_template_id;

	INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('New ESI', true, 0, proposal_esi_template_id)
	RETURNING topic_id INTO proposal_esi_template_topic_id;

	INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('proposal_esi_basis', proposal_esi_template_id, proposal_esi_template_topic_id, 0, '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}', 'AND');

	INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('default sample esi template', 'default sample esi template', false, 'SAMPLE_ESI')
	RETURNING template_id INTO sample_esi_template_id;

	INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('New Sample ESI', true, 0, sample_esi_template_id)
	RETURNING topic_id INTO sample_esi_template_topic_id;

	INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('sample_esi_basis', sample_esi_template_id, sample_esi_template_topic_id, 0, '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}', 'AND');

	UPDATE public.call SET esi_template_id=proposal_esi_template_id;

	-- Insert Questions for Proposal ESI template
	-- BOOLEAN Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_boolean_question', 'BOOLEAN', 'Proposal ESI Boolean question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'proposal_esi_boolean_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_boolean_question', 5, 5, 3, '{
            "tooltip": "",
            "required": false,
            "small_label": ""
        }'
  );

-- Date Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_date_question', 'DATE', 'Proposal ESI Date question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'proposal_esi_date_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_date_question', 5, 5, 4, '{ "tooltip": "","required": false,"small_label": "" }'
  );

-- INTERVAL Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_interval_question', 'INTERVAL', 
    'Proposal ESI Interval question from seeds', 
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
    'proposal_esi_interval_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_interval_question', 5, 5, 6, '{
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
-- NUMBER INPUT Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_number_question', 'NUMBER_INPUT', 
    'Proposal ESI Number question from seeds', '{
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
    'proposal_esi_number_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_number_question', 5, 5, 7, '{
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
-- Rich text input Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_rich_text_input_question', 'RICH_TEXT_INPUT', 
    'Proposal ESI Rich text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'proposal_esi_rich_text_input_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_rich_text_input_question', 5, 5, 
    8, '{ "tooltip": "", "required": false, "small_label": "" }'
  );
-- Selection from options Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_selection_from_options_question', 
    'SELECTION_FROM_OPTIONS', 'Proposal ESI Selection from options question from seeds', 
    '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'proposal_esi_selection_from_options_question', 
    1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_selection_from_options_question', 
    5, 5, 9, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}'
  );

-- Text input Question for Proposal ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'proposal_esi_text_input_question', 'TEXT_INPUT', 
    'Proposal ESI Text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'proposal_esi_text_input_question', 1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'proposal_esi_text_input_question', 5, 5, 11, '{ "tooltip": "", "required": false, "small_label": "" }'
  );

-- 	-- Insert Questions for Sample ESI template
	-- BOOLEAN Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_boolean_question', 'BOOLEAN', 'Sample ESI Boolean question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_esi_boolean_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_boolean_question', 6, 6, 3, '{
            "tooltip": "",
            "required": false,
            "small_label": ""
        }'
  );

-- Date Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_date_question', 'DATE', 'Sample ESI Date question from seeds', 
    '{
        "tooltip": "",
        "required": false,
        "small_label": ""
        }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_esi_date_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_date_question', 6, 6, 4, '{ "tooltip": "","required": false,"small_label": "" }'
  );

-- INTERVAL Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_interval_question', 'INTERVAL', 
    'Sample ESI Interval question from seeds', 
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
    'sample_esi_interval_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_interval_question', 6, 6, 6, '{
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
-- NUMBER INPUT Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_number_question', 'NUMBER_INPUT', 
    'Sample ESI Number question from seeds', '{
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
    'sample_esi_number_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_number_question', 6, 6, 7, '{
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
-- Rich text input Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_rich_text_input_question', 'RICH_TEXT_INPUT', 
    'Sample ESI Rich text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_esi_rich_text_input_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_rich_text_input_question', 6, 6, 
    8, '{ "tooltip": "", "required": false, "small_label": "" }'
  );
-- Selection from options Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_selection_from_options_question', 
    'SELECTION_FROM_OPTIONS', 'Sample ESI Selection from options question from seeds', 
    '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_esi_selection_from_options_question', 
    1
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_selection_from_options_question', 
    6, 6, 9, '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}'
  );



-- Text input Question for Sample ESI Template
INSERT INTO questions(
  question_id, data_type, question, 
  default_config, created_at, updated_at, 
  natural_key, category_id
) 
VALUES 
  (
    'sample_esi_text_input_question', 'TEXT_INPUT', 
    'Sample ESI Text input question from seeds', 
    '{ "tooltip": "","required": false,"small_label": "" }', 
    '2022-02-08 10:23:10.285415+00', 
    '2022-02-08 10:23:10.285415+00', 
    'sample_esi_text_input_question', 2
  );
INSERT INTO templates_has_questions(
  question_id, template_id, topic_id, 
  sort_order, config
) 
VALUES 
  (
    'sample_esi_text_input_question', 6, 6, 11, '{ "tooltip": "", "required": false, "small_label": "" }'
  );

	

END;
$DO$
LANGUAGE plpgsql;

