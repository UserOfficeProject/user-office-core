DO
$$
BEGIN
	IF register_patch('AlterProposalQuestionDependencies.sql', 'jekabskarklins', 'BUGFIX can''t save long dependencies', '2019-11-11') THEN
	BEGIN



  
		ALTER TABLE proposal_question_dependencies ALTER COLUMN condition TYPE VARCHAR(1024);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
