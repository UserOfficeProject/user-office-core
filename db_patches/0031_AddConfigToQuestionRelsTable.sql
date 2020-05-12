DO
$$
BEGIN
	IF register_patch('AddConfigToQuestionRelsTable.sql', 'jekabskarklins', 'Adding config override column', '2020-05-12') THEN
	BEGIN

	ALTER table proposal_question__proposal_template__rels
	ADD COLUMN config VARCHAR(512) DEFAULT NULL 

	ALTER TABLE proposal_questions
	RENAME COLUMN config TO default_config;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
