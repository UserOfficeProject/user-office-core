DO
$$
BEGIN
	IF register_patch('AddProposalTemplateHeaderFooter.sql', 'Yoganandan Pandiyan', 'Adding Header and Footer to Proposal Template', '2023-07-21') THEN
		BEGIN
    	ALTER TABLE pdf_templates 
			ADD COLUMN template_header TEXT NOT NULL DEFAULT '',
			ADD COLUMN template_footer TEXT NOT NULL DEFAULT '';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;