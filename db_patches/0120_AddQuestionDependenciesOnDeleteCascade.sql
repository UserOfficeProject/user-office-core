DO
$DO$
BEGIN
	IF register_patch('AddQuestionDependenciesOnDeleteCascade.sql', 'Jekabs Karklins', 'Add question dependency on delete cascade', '2022-04-29') THEN
    BEGIN
      
      -- Remove dangling references in question_dependencies from question_id  when question deleted
      ALTER TABLE question_dependencies
      DROP CONSTRAINT question_dependencies_question_id_fkey,
                      ADD CONSTRAINT question_dependencies_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES questions (question_id) MATCH SIMPLE
      ON DELETE CASCADE;


      -- Remove dangling references in question_dependencies from dependency_question_id when question deleted
      ALTER TABLE question_dependencies
      DROP CONSTRAINT question_dependencies_dependency_question_id_fkey,
                      ADD CONSTRAINT question_dependencies_dependency_question_id_fkey
      FOREIGN KEY (dependency_question_id) REFERENCES questions (question_id) MATCH SIMPLE
      ON DELETE CASCADE;

      -- Remove dangling references in question_dependencies from dependency_question_id templates_has_questions deleted
      ALTER TABLE question_dependencies
        ADD CONSTRAINT question_dependencies_template_id_question_id_fkey
        FOREIGN KEY  (template_id, question_id) 
        REFERENCES templates_has_questions (template_id, question_id)
        ON DELETE CASCADE;

    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
