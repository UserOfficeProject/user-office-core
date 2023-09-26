

DO
$$
BEGIN
	IF register_patch('AddUniqueConstraintToQuestionaryId.sql', 'jekabskarklins', 'Unique constraint', '2020-07-29') THEN
    BEGIN
        ALTER TABLE answer_has_questionaries ADD CONSTRAINT unique_question_id UNIQUE (questionary_id);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;