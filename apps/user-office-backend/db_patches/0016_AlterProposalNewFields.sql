DO
$$
BEGIN
	IF register_patch('AlterProposalNewFields.sql', 'fredrikbolmsten', 'Adding new columns for proposals', '2020-02-16') THEN
	BEGIN


  

		ALTER TABLE proposals ADD COLUMN rank_order INT DEFAULT NULL;
		ALTER TABLE proposals ADD COLUMN final_status INT DEFAULT NULL;



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
