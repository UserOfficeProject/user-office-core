DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('CreateTableRiskAssesments.sql', 'jekabskarklins', 'Add Risk Assesments Table', '2021-07-28') THEN
        
      CREATE TABLE risk_assessments (
        risk_assessment_id serial PRIMARY KEY
        , proposal_pk int UNIQUE REFERENCES proposals(proposal_pk) ON DELETE CASCADE
        , creator_user_id int REFERENCES users(user_id)
        , questionary_id int UNIQUE REFERENCES questionaries(questionary_id) ON DELETE CASCADE
        , status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'ACCEPTED')) DEFAULT 'DRAFT' 
        , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ); 

        /* Delete risk assesment questionary data when risk assesment is deleted */
        CREATE OR REPLACE FUNCTION after_risk_assesment_delete() RETURNS trigger AS $body$
        BEGIN
            DELETE FROM 
                questionaries
            WHERE
                questionary_id = old.questionary_id;
        RETURN old;
        END;
        $body$ LANGUAGE 'plpgsql';

        CREATE TRIGGER risk_assesment_delete_trigger AFTER DELETE ON "risk_assessments"
        FOR EACH ROW EXECUTE PROCEDURE after_risk_assesment_delete();
      
        ALTER TABLE proposals DROP column risk_assessment_questionary_id;

        INSERT INTO template_categories(name) VALUES('Risk assessment');

        INSERT INTO question_datatypes(question_datatype_id) VALUES('RISK_ASSESSMENT_BASIS');

        INSERT INTO questions(
            question_id,
            data_type,
            question,
            default_config,
            natural_key,
            category_id
        )
    VALUES(
            'risk_assessment_basis',
            'RISK_ASSESSMENT_BASIS',
            'Risk assessment basic information',
            '{"required":false,"small_label":"","tooltip":""}',
            'risk_assessment_basis',
            5
        );
	END IF;
END;
$$
LANGUAGE plpgsql;