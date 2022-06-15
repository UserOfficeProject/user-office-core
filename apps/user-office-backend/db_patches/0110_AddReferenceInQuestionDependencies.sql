DO
$$
BEGIN
    IF register_patch('AddReferenceInQuestionDependencies.sql', 'Jekabs Karklins', 'Adding reference from question_dependenies to templates_has_questions table', '2021-10-18') THEN

        -- Remove UNIQUE will be replaced with PKey
        ALTER TABLE templates_has_questions
        DROP CONSTRAINT unq_question_id_template_id;

        -- Remove old PKey and delete the PKey column, will be replaced with composite PKey
        ALTER TABLE templates_has_questions
        DROP CONSTRAINT templates_has_questions_pkey;

        ALTER TABLE templates_has_questions
        DROP COLUMN id;

        -- Add new PKey
        ALTER TABLE templates_has_questions
        ADD CONSTRAINT templates_has_questions_pkey 
        PRIMARY KEY (template_id, question_id);

        -- Reference the new PKey in question_dependenies and add CASCADE on DELETE
        ALTER TABLE question_dependencies
        ADD CONSTRAINT question_dependencies_template_id_dependency_question_id_fkey
        FOREIGN KEY  (template_id, dependency_question_id) 
        REFERENCES templates_has_questions (template_id, question_id)
        ON DELETE CASCADE;

    END IF;

END;
$$
LANGUAGE plpgsql;