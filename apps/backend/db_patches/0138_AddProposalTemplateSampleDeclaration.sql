DO
$$
BEGIN
	IF register_patch('AddProposalTemplateSampleDeclaration.sql', 'Yoganandan Pandiyan', 'Adding Sample Declaration to Proposal Template', '2023-09-20') THEN
		BEGIN
    	ALTER TABLE pdf_templates 
			ADD COLUMN template_sample_declaration TEXT NOT NULL DEFAULT '';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;