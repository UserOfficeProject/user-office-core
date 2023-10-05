DO
$$
BEGIN
	IF register_patch('AddQuestionDependencies.sql', 'martintrajanovski', 'Store question dependencies in their own table so we can have multiple dependencies on one question.', '2021-01-12') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS question_dependencies (
				question_dependency_id SERIAL PRIMARY KEY,
				template_id INTEGER NOT NULL REFERENCES templates(template_id) ON DELETE CASCADE,
				question_id VARCHAR(64) NOT NULL REFERENCES questions(question_id),
				dependency_question_id VARCHAR(64) REFERENCES questions(question_id),
				dependency_condition jsonb
			);

			INSERT INTO question_dependencies
			(
				template_id,
				question_id,
				dependency_question_id,
				dependency_condition
			)
			SELECT
				template_id,
				question_id,
				dependency_question_id,
				dependency_condition
			FROM  templates_has_questions
			WHERE dependency_question_id IS NOT NULL;

			ALTER TABLE templates_has_questions DROP COLUMN dependency_question_id;
			ALTER TABLE templates_has_questions DROP COLUMN dependency_condition;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;