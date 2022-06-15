DO
$$
BEGIN
	IF register_patch('AlterProposalUser.sql', 'jekabskarklins', 'Implementing deleting proposal', '2019-10-17') THEN
	BEGIN

  

      alter table proposal_user
      drop constraint IF EXISTS proposal_user_proposal_id_fkey,
      add constraint proposal_user_proposal_id_fkey
         foreign key (proposal_id)
         references proposals(proposal_id)
         on delete cascade;
         
      alter table proposal_answers
      drop constraint IF EXISTS proposal_answers_proposal_id_fkey,
      add constraint proposal_answers_proposal_id_fkey
         foreign key (proposal_id)
         references proposals(proposal_id)
         on delete cascade;
         
      alter table proposal_topic_completenesses
      drop constraint IF EXISTS proposal_topic_completenesses_proposal_id_fkey,
      add constraint proposal_topic_completenesses_proposal_id_fkey
         foreign key (proposal_id)
         references proposals(proposal_id)
         on delete cascade;



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
