DO
$$
BEGIN
	IF register_patch('Alter_proposal_question_dependencies.sql', 'jekabskarklins', 'Adding more fields for proposal template versioning', '2020-03-30') THEN
	BEGIN



    ALTER table proposal_question_dependencies
	ADD COLUMN template_id INTEGER REFERENCES proposal_templates(template_id),
	ADD COLUMN sort_order INTEGER,
	ADD COLUMN topic_id INTEGER;
	
    ALTER TABLE proposal_question_dependencies DROP CONSTRAINT proposal_question_dependencies_pkey;

    ALTER TABLE proposal_question_dependencies
	ADD CONSTRAINT proposal_question_dependencies_pkey PRIMARY KEY(proposal_question_id, template_id);

	ALTER table proposals
	ADD COLUMN template_id INTEGER NOT NULL REFERENCES proposal_templates(template_id) DEFAULT 1;
	
	ALTER TABLE proposals ALTER COLUMN template_id DROP DEFAULT;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;