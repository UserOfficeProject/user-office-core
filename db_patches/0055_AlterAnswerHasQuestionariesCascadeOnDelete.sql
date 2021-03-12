DO
$$
BEGIN
	IF register_patch('AlterAnswerHasQuestionariesCascadeOnDelete.sql', 'jekabskarklins', 'Delete entries when answer is deleted', '2020-05-13') THEN
	BEGIN

	ALTER TABLE answer_has_questionaries
	DROP CONSTRAINT answer_has_questionaries_questionary_id_fkey,
	ADD CONSTRAINT answer_has_questionaries_questionary_id_fkey
		FOREIGN KEY (questionary_id)
		REFERENCES questionaries(questionary_id)
		ON DELETE CASCADE
		ON UPDATE CASCADE;

	ALTER TABLE answer_has_questionaries
	DROP CONSTRAINT answer_has_questionaries_answer_id_fkey,
	ADD CONSTRAINT answer_has_questionaries_answer_id_fkey
		FOREIGN KEY (answer_id)
		REFERENCES answers(answer_id)
		ON DELETE CASCADE
		ON UPDATE CASCADE;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
