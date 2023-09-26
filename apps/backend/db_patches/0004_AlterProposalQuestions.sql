DO
$$
BEGIN
	IF register_patch('AlterProposalQuestions.sql', 'jekabskarklins', 'BUGFIX can''t save large enbellishments', '2019-10-17') THEN
	BEGIN



  
		ALTER TABLE proposal_questions ALTER COLUMN config TYPE TEXT;



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
