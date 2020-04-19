DO
$$
BEGIN
	IF register_patch('Alter_proposal_question_dependencies.sql', 'jekabskarklins', 'Adding more fields for proposal template versioning', '2020-03-30') THEN
	BEGIN

	ALTER table proposals
	ADD COLUMN call_id INTEGER NOT NULL REFERENCES call(call_id) DEFAULT 1,
	ADD COLUMN template_id INTEGER NOT NULL REFERENCES proposal_templates(template_id) DEFAULT 1;

	ALTER table proposal_topics
	ADD COLUMN template_id INTEGER NOT NULL REFERENCES proposal_templates(template_id) DEFAULT 1;

	ALTER TABLE proposals ALTER COLUMN call_id DROP DEFAULT;
	ALTER TABLE proposals ALTER COLUMN template_id DROP DEFAULT;
	ALTER TABLE proposal_topics ALTER COLUMN template_id DROP DEFAULT;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;