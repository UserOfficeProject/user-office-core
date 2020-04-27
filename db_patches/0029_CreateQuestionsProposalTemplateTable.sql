DO
$$
BEGIN
	IF register_patch('CreateQuestionsTemplateRelationTable.sql', 'jekabskarklins', 'Create table proposal_question__proposal_template__rels, and migrate data from proposal_question_dependencies', '2020-04-08') THEN
	BEGIN



    CREATE TABLE IF NOT EXISTS
        proposal_question__proposal_template__rels(
              id SERIAL PRIMARY KEY
            , proposal_question_id VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
            , template_id INTEGER NOT NULL REFERENCES proposal_templates(template_id) ON DELETE CASCADE
            , topic_id INTEGER NOT NULL REFERENCES proposal_topics(topic_id) ON DELETE CASCADE
            , sort_order INTEGER NOT NULL
            , dependency_proposal_question_id VARCHAR(64) REFERENCES proposal_questions(proposal_question_id) 
            , dependency_condition VARCHAR(1024)
            , CONSTRAINT unq_proposal_question_id_template_id UNIQUE(proposal_question_id,template_id)
        );



        INSERT INTO proposal_question__proposal_template__rels(
            proposal_question_id
            , template_id
            , topic_id
            , sort_order
            , dependency_proposal_question_id
            , dependency_condition
        )
        SELECT 
            Q.proposal_question_id
            , 1
            , Q.topic_id
            , Q.sort_order
            , D.proposal_question_dependency
            , D.condition
        FROM 
            proposal_questions as Q
        LEFT JOIN
            proposal_question_dependencies as D
        ON 
            Q.proposal_question_id = D.proposal_question_id;

        DROP TABLE proposal_question_dependencies;

        ALTER TABLE proposal_questions DROP COLUMN topic_id;
        ALTER TABLE proposal_questions DROP COLUMN sort_order;

    END;
	END IF;

    
END;
$$
LANGUAGE plpgsql;
