DO
$DO$
BEGIN

 INSERT INTO questions(
	  question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id)
	VALUES 
    ( 'number_question' 
    , 'NUMBER_INPUT'
    , 'Number question from seeds'
    , '{
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
  , '2022-02-08 10:23:10.285415+00'
  , '2022-02-08 10:23:10.285415+00'
  , 'number_question'
  , 1 );

  INSERT INTO templates_has_questions(
	  question_id, template_id, topic_id, sort_order, config)
	VALUES (
		  'number_question'
		, 1
		, 5
		, 2
		, '{
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
	  questionary_id, question_id, answer)
	VALUES (
    1
  , 'number_question'
  , '{
    "value": {
        "unit": {
            "id": "centimeter",
            "unit": "centimeter",
            "symbol": "cm",
            "quantity": "length",
            "siConversionFormula": "x / 100"
        },
        "value": 10,
        "siValue": 0.1
    }
}'
  );

END;
$DO$
LANGUAGE plpgsql;