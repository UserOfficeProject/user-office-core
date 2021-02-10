DO
$$
BEGIN
    IF register_patch('AddRichTextInputDataType.sql', 'Peter Asztalos', 'Add Rich Text Input Data type', '2021-02-02') THEN

      INSERT INTO "question_datatypes" ("question_datatype_id") VALUES ('RICH_TEXT_INPUT');

    END IF;
END;
$$
LANGUAGE plpgsql;