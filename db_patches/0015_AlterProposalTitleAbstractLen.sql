DO
$$
BEGIN
	IF register_patch('AlterProposalTitleAbstractLen.sql', 'fredrikbolmsten', 'Make proposal title longer', '2019-12-10') THEN
	BEGIN


  
		ALTER TABLE proposals ALTER COLUMN title TYPE varchar(350);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
