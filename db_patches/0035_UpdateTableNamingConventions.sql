DO
$$
BEGIN
	IF register_patch('UpdateTableNamingConventions.sql', 'jekabskarklins', 'Updating database naming conventions or generic templates', '2020-05-26') THEN
	BEGIN

	ALTER TABLE proposal_answers RENAME TO answers;
	ALTER TABLE proposal_answers_files RENAME TO answer_has_files;
	ALTER TABLE proposal_question__proposal_template__rels RENAME TO templates_has_questions;
	ALTER TABLE proposal_question_datatypes RENAME TO question_datatypes;
	ALTER TABLE proposal_questions RENAME TO questions;
	ALTER TABLE proposal_templates RENAME TO templates;
	ALTER TABLE proposal_topic_completenesses RENAME TO topic_completenesses;
	ALTER TABLE proposal_topics RENAME TO topics;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;