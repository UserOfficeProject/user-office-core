DO
$$
BEGIN
	IF register_patch('AddProposalByScientistComment.sql', 'Farai Mutambara', 'Adding proposal comment by scientist', '2024-10-22') THEN
		BEGIN
		ALTER table proposals ADD COLUMN comment_by_scientist TEXT NULL;
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;