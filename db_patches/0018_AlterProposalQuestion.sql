DO
$$
BEGIN
	IF register_patch('AlterProposalQuestion.sql', 'jekabskarklins', 'Adding column nid (natural id)', '2020-02-24') THEN
	BEGIN


  
		ALTER TABLE proposal_questions 
			ADD COLUMN natural_key VARCHAR(128) UNIQUE; 

		UPDATE proposal_questions SET natural_key = proposal_question_id;



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
