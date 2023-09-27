DO
$$
BEGIN
	IF register_patch('AlterProposalAddNotified.sql', 'fredrikbolmsten', 'Adding notified field for proposal', '2020-05-19') THEN
	BEGIN

	ALTER table proposals ADD COLUMN notified BOOLEAN DEFAULT FALSE;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;