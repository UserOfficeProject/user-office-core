DO
$$
BEGIN
	IF register_patch('AlterProposalTopicsDeleteOnCascade.sql', 'jekabskarklins', 'Delete topics when template is deleted', '2020-05-13') THEN
	BEGIN

	ALTER TABLE proposal_topics
	DROP CONSTRAINT proposal_topics_template_id_fkey,
	ADD CONSTRAINT proposal_topics_template_id_fkey
		FOREIGN KEY (template_id)
		REFERENCES proposal_templates(template_id)
		ON DELETE CASCADE;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
