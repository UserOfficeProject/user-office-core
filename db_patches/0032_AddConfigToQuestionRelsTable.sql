DO
$$
BEGIN
	IF register_patch('AddConfigToQuestionRelsTable.sql', 'jekabskarklins', 'Adding config override column', '2020-05-12') THEN
	BEGIN

	ALTER TABLE proposal_questions
	RENAME COLUMN config TO default_config;

	ALTER table proposal_question__proposal_template__rels
	ADD COLUMN config TEXT DEFAULT NULL;

	UPDATE proposal_question__proposal_template__rels as rels
	SET config = (
		SELECT default_config 
		FROM proposal_questions as questions
		WHERE questions.proposal_question_id = rels.proposal_question_id
		);

	ALTER TABLE proposal_question__proposal_template__rels
	ALTER COLUMN config SET NOT NULL;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
