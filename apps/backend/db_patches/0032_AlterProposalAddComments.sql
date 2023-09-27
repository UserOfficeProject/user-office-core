DO
$$
BEGIN
	IF register_patch('AlterProposalAddComments.sql', 'fredrikbolmsten', 'Adding more fields for proposal', '2020-05-12') THEN
	BEGIN

	ALTER table proposals ADD COLUMN comment_for_management text;
	ALTER table proposals ADD COLUMN comment_for_user text;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;