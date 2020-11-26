DO
$$
BEGIN
  IF register_patch('AddProposalIdToSamples.sql', 'jekabskarklins', 'Adding columns proposal_id and question_id to samples', '2020-10-22') THEN
    BEGIN

    ALTER TABLE "samples" ADD "proposal_id" INT DEFAULT NULL;

    ALTER TABLE "samples" ADD CONSTRAINT samples_proposal_id_fkey 
      FOREIGN KEY ("proposal_id") 
      REFERENCES "proposals" ("proposal_id")
      ON DELETE CASCADE;

    ALTER TABLE "samples" ADD "question_id" VARCHAR(64) DEFAULT NULL;

    ALTER TABLE "samples" ADD CONSTRAINT samples_question_id_fkey 
          FOREIGN KEY ("question_id") 
          REFERENCES "questions" ("question_id")
          ON DELETE CASCADE;


    DROP TABLE answer_has_questionaries;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;