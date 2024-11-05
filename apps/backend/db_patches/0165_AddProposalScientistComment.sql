DO
$$
BEGIN
	IF register_patch('0165_AddProposalScientistComment.sql', 'Farai Mutambara', 'Adding proposal comment by scientist', '2024-10-31') THEN
		BEGIN
		ALTER table proposals ADD COLUMN comment_by_scientist TEXT NULL;
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;