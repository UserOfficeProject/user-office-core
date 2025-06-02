DO
$$
BEGIN
    IF register_patch('0171_DropTableQuestionHasTemplates.sql', 'Yoganandan Pandiyan',  'Drop Table questions_has_templatess', '2025-03-05') THEN
        DROP TABLE IF EXISTS questions_has_template;
    END IF;
END;
$$
LANGUAGE plpgsql;
