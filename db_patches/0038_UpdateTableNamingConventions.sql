DO
$$
BEGIN
	IF register_patch('UpdateTableNamingConventions.sql', 'jekabskarklins', 'Updating database naming conventions for generic templates', '2020-05-26') THEN
	BEGIN

	/* altering table names*/
	ALTER TABLE proposal_answers RENAME TO answers;
	ALTER TABLE proposal_answers_files RENAME TO answer_has_files;
	ALTER TABLE proposal_question__proposal_template__rels RENAME TO templates_has_questions;
	ALTER TABLE proposal_question_datatypes RENAME TO question_datatypes;
	ALTER TABLE proposal_questions RENAME TO questions;
	ALTER TABLE proposal_templates RENAME TO templates;
	ALTER TABLE proposal_topics RENAME TO topics;
	ALTER TABLE proposal_topic_completenesses RENAME TO topic_completenesses;

	/* simply altering name of columns */
	ALTER TABLE templates_has_questions RENAME COLUMN proposal_question_id TO question_id;
	ALTER TABLE templates_has_questions RENAME COLUMN dependency_proposal_question_id TO dependency_question_id;
	ALTER TABLE answers RENAME COLUMN proposal_question_id TO question_id;
	ALTER TABLE question_datatypes RENAME COLUMN proposal_question_datatype_id TO question_datatype_id;
	ALTER TABLE questions RENAME COLUMN proposal_question_id TO question_id;

	/* changing from proposal_id to questionary_id */
	ALTER TABLE topic_completenesses RENAME COLUMN proposal_id TO questionary_id; /* constraint updated down  */
    ALTER TABLE answers RENAME COLUMN proposal_id TO questionary_id; /* constraint updated down  */
	
	/* changing from template_id to questionary_id */
	ALTER TABLE proposals RENAME COLUMN template_id TO questionary_id; /* constraint updated down  */


	CREATE TABLE IF NOT EXISTS template_categories (
		template_category_id  serial PRIMARY KEY
		, name    VARCHAR(100) NOT NULL
	);

	CREATE TABLE IF NOT EXISTS questionaries (
		questionary_id  serial PRIMARY KEY
		, template_id   INTEGER REFERENCES templates (template_id)
		, created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS answer_has_questionaries (
		questionary_id INTEGER REFERENCES questionaries (questionary_id)
		, answer_id INTEGER REFERENCES answers (answer_id)
	);

	CREATE TABLE IF NOT EXISTS questions_has_template (
		template_id   INTEGER REFERENCES templates (template_id)
		, question_id VARCHAR(64) REFERENCES questions (question_id)
	);






	/* renaming constraints */
	ALTER TABLE answer_has_files RENAME CONSTRAINT proposal_answers_files_answer_id_fkey TO answer_has_files_answer_id_fkey;
	ALTER TABLE answer_has_files RENAME CONSTRAINT proposal_answers_files_file_id_fkey TO answer_has_files_file_id_fkey;

	ALTER TABLE templates_has_questions RENAME CONSTRAINT proposal_question__proposal_template__rels_pkey TO templates_has_questions_pkey;
	ALTER TABLE templates_has_questions RENAME CONSTRAINT proposal_question__proposal_t_dependency_proposal_question_fkey TO templates_has_questions_dependency_question_id_fkey;
	ALTER TABLE templates_has_questions RENAME CONSTRAINT proposal_question__proposal_template__proposal_question_id_fkey TO templates_has_questions_question_id_fkey;
	ALTER TABLE templates_has_questions RENAME CONSTRAINT proposal_question__proposal_template__rels_template_id_fkey TO templates_has_questions_template_id_fkey;
	ALTER TABLE templates_has_questions RENAME CONSTRAINT proposal_question__proposal_template__rels_topic_id_fkey TO templates_has_questions_topic_id_fkey;
	ALTER TABLE templates_has_questions RENAME CONSTRAINT unq_proposal_question_id_template_id TO unq_question_id_template_id;
		
	ALTER TABLE question_datatypes RENAME CONSTRAINT proposal_question_datatypes_pkey TO question_datatypes_pkey;

	ALTER TABLE questions RENAME CONSTRAINT proposal_questions_pkey TO questions_pkey;
	ALTER TABLE questions RENAME CONSTRAINT proposal_questions_data_type_fkey TO questions_data_type_fkey;
	ALTER TABLE questions RENAME CONSTRAINT proposal_questions_natural_key_key TO questions_natural_key_key;

	ALTER TABLE templates RENAME CONSTRAINT proposal_templates_pkey TO templates_pkey;

	ALTER TABLE topics RENAME CONSTRAINT proposal_topics_pkey TO topics_pkey;
	ALTER TABLE topics RENAME CONSTRAINT proposal_topics_template_id_fkey TO topics_template_id_fkey;

	ALTER TABLE topic_completenesses RENAME CONSTRAINT proposal_topic_completenesses_pkey TO topic_completenesses_pkey;
	ALTER TABLE topic_completenesses RENAME CONSTRAINT proposal_topic_completenesses_topic_id_fkey TO topic_completenesses_topic_id_fkey;

	ALTER TABLE answers RENAME CONSTRAINT proposal_answers_pkey TO answers_pkey;
	ALTER TABLE answers RENAME CONSTRAINT proposal_answers_proposal_question_id_fkey TO answers_question_id_fkey;
	ALTER TABLE answers RENAME CONSTRAINT proposal_answers_answer_id_key TO answers_answer_id_key;

	/* altering constraints to point to questionary_id */
	/* proposals(questionary_id) */
	ALTER TABLE public.proposals DROP CONSTRAINT proposals_template_id_fkey;

	CREATE OR REPLACE FUNCTION CreateQuestionary()
	RETURNS integer AS $func$
	declare
		q_id integer;
	BEGIN
	insert into questionaries(template_id) values(1) returning questionary_id into q_id;
	RETURN q_id;
	END;
	$func$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION UpdateProposalsTable() 
	RETURNS VOID 
	AS
	$func$
	DECLARE 
	t_row proposals%rowtype;
	BEGIN
		FOR t_row in SELECT * FROM proposals LOOP
			update proposals
				set questionary_id = CreateQuestionary()
			where proposal_id = t_row.proposal_id;
		END LOOP;
	END;
	$func$ 
	LANGUAGE plpgsql;

	PERFORM UpdateProposalsTable();   /* Create new questionary for each proposal */

	ALTER TABLE public.proposals
	ADD CONSTRAINT proposals_questionary_id_fkey FOREIGN KEY (questionary_id)
		REFERENCES public.questionaries (questionary_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION;

		
	/* topic_completenesses(questionary_id) */
	ALTER TABLE topic_completenesses DROP CONSTRAINT proposal_topic_completenesses_proposal_id_fkey;
	
	CREATE OR REPLACE FUNCTION UpdateCompletenesses() 
	RETURNS VOID 
	AS
	$func$
	DECLARE 
	t_row topic_completenesses%rowtype;
	BEGIN
		FOR t_row in SELECT * FROM topic_completenesses LOOP
			update topic_completenesses TC
				set questionary_id = (SELECT questionary_id from proposals P where TC.questionary_id = P.proposal_id)
			where 
				questionary_id = t_row.questionary_id AND 
				topic_id = t_row.topic_id ;
		END LOOP;
	END;
	$func$ 
	LANGUAGE plpgsql;

	PERFORM UpdateCompletenesses();
	
	ALTER TABLE topic_completenesses
	ADD CONSTRAINT topic_completenesses_questionary_id_fkey FOREIGN KEY (questionary_id)
		REFERENCES questionaries (questionary_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE CASCADE;
	

	/* answers(questionary_id)*/
	ALTER TABLE answers DROP CONSTRAINT proposal_answers_proposal_id_fkey;

	CREATE OR REPLACE FUNCTION UpdateAnswers() 
	RETURNS VOID 
	AS
	$func$
	DECLARE 
	t_row answers%rowtype;
	BEGIN
		FOR t_row in SELECT * FROM answers LOOP
			update answers A
				set questionary_id = (SELECT questionary_id from proposals P where A.questionary_id = P.proposal_id)
			where 
				answer_id = t_row.answer_id;
		END LOOP;
	END;
	$func$ 
	LANGUAGE plpgsql;

	PERFORM UpdateAnswers();
	
	ALTER TABLE answers
	ADD CONSTRAINT answers_questionary_id_fkey FOREIGN KEY (questionary_id)
		REFERENCES questionaries (questionary_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE CASCADE;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;