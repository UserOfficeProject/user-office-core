DO
$$
BEGIN
	IF register_patch('AddProposalTemplateDummyData.sql', 'Yoganandan Pandiyan', 'Adding Dummy Data to Proposal Template', '2023-10-25') THEN
		BEGIN
    	ALTER TABLE pdf_templates 
			ADD COLUMN dummy_data TEXT NOT NULL DEFAULT '';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;