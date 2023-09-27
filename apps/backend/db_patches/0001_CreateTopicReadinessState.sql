DO
$$
BEGIN
	IF register_patch('CreateTopicReadinessState.sql', 'jekabskarklins', 'Adding new table for keeping track which steps have been finished when submitting proposal', '2019-10-17') THEN
	BEGIN

  

    CREATE TABLE IF NOT EXISTS proposal_topic_completenesses(
      proposal_id INT NOT NULL REFERENCES proposals(proposal_id)
    , topic_id INT NOT NULL REFERENCES proposal_topics(topic_id)
    , is_complete BOOLEAN NOT NULL DEFAULT FALSE
    , PRIMARY KEY (proposal_id, topic_id)
    );

    CREATE 
        INDEX UX_proposal_topic_completenesses_proposal_id  
    ON 
        proposal_topic_completenesses(proposal_id);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
