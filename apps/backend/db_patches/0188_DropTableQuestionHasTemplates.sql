DO
$$
BEGIN
    IF register_patch('DropTableQuestionHasTemplates.sql', 'Yoganandan Pandiyan',  'Drop Table questions_has_template', '2025-03-05') THEN
        DROP TABLE IF EXISTS questions_has_template;
    END IF;
END;
$$
LANGUAGE plpgsql;
