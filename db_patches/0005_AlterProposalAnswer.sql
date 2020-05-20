DO
$$
BEGIN
	IF register_patch('AlterProposalAnswer.sql', 'jekabskarklins', 'BUGFIX can''t save long answers', '2019-11-06') THEN
	BEGIN



  
		ALTER TABLE proposal_answers ALTER COLUMN answer TYPE TEXT;



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
