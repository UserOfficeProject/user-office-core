DO
$$
BEGIN
    IF register_patch('ExperimentSafetyInput.sql', 'Jekabs Karklins', 'Replacing risk assessments with experiment safety input #SWAP-1835', '2021-09-17') THEN

        DROP TABLE risk_assessments_has_samples; -- Cleaning up old data
        DROP TABLE risk_assessments;             -- Cleaning up old data

        DELETE FROM visits;                      -- Cleaning up old data

        CREATE TABLE experiment_safety_inputs (
              esi_id serial PRIMARY KEY
            , visit_id INT REFERENCES visits(visit_id) ON DELETE CASCADE
            , creator_id INT NOT NULL REFERENCES users(user_id)
            , questionary_id INT NOT NULL UNIQUE REFERENCES questionaries(questionary_id) ON UPDATE CASCADE
            , is_submitted BOOLEAN DEFAULT FALSE
            , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        ); 


        CREATE TABLE sample_experiment_safety_inputs (
              esi_id int REFERENCES experiment_safety_inputs(esi_id) ON DELETE CASCADE
            , sample_id int REFERENCES samples(sample_id) ON DELETE CASCADE
            , questionary_id INT NOT NULL UNIQUE REFERENCES questionaries(questionary_id) ON UPDATE CASCADE
            , is_submitted BOOLEAN DEFAULT FALSE
            , PRIMARY KEY (esi_id, sample_id)
        ); 

        /* Clean up questionary if experiment_safety_inputs is deleted */
        CREATE OR REPLACE FUNCTION after_esi_delete() RETURNS trigger AS $body$
            BEGIN
                DELETE FROM 
                    questionaries
                WHERE
                    questionary_id = old.questionary_id;
            RETURN old;
            END;
            $body$ LANGUAGE 'plpgsql';


        CREATE TRIGGER after_experiment_safety_inputs_delete_trigger AFTER DELETE ON "experiment_safety_inputs"
        FOR EACH ROW EXECUTE PROCEDURE after_esi_delete();

        CREATE TRIGGER after_sample_experiment_safety_inputs_delete_trigger AFTER DELETE ON "sample_experiment_safety_inputs"
        FOR EACH ROW EXECUTE PROCEDURE after_esi_delete();
        /* End cleanup*/

        UPDATE question_datatypes set question_datatype_id='PROPOSAL_ESI_BASIS' WHERE question_datatype_id='RISK_ASSESSMENT_BASIS';
        UPDATE questions set question_id='proposal_esi_basis', natural_key='proposal_esi_basis', question='Proposal ESI basis' WHERE question_id='risk_assessment_basis';

        INSERT INTO question_datatypes(question_datatype_id) VALUES('SAMPLE_ESI_BASIS');
        INSERT INTO questions(
            question_id,
            data_type,
            question,
            default_config,
            natural_key,
            category_id
        )
        VALUES(
                'sample_esi_basis',
                'SAMPLE_ESI_BASIS',
                'Sample ESI basic information',
                '{"required":false,"small_label":"","tooltip":""}',
                'sample_esi_basis',
                2
            );

        ALTER table call ADD COLUMN esi_template_id INTEGER DEFAULT NULL REFERENCES templates (template_id);

        /* adding group to templates */

        CREATE TABLE template_groups (
            template_group_id VARCHAR(30) PRIMARY KEY
            , category_id INT REFERENCES template_categories(template_category_id)
        ); 


        INSERT INTO template_groups (template_group_id, category_id)
        VALUES
            ('PROPOSAL', 1),
            ('PROPOSAL_ESI', 1),
            ('SAMPLE', 2),
            ('SAMPLE_ESI', 2),
            ('SHIPMENT', 3),
            ('VISIT_REGISTRATION', 4);

        ALTER table templates ADD COLUMN group_id VARCHAR(30) DEFAULT NULL REFERENCES template_groups(template_group_id);

        UPDATE templates SET group_id='PROPOSAL' where category_id=1;
        UPDATE templates SET group_id='SAMPLE' where category_id=2;
        UPDATE templates SET group_id='SHIPMENT' where category_id=3;
        UPDATE templates SET group_id='VISIT_REGISTRATION' where category_id=4;
		UPDATE templates SET group_id='PROPOSAL' where category_id= 5;
		UPDATE templates SET group_id='SAMPLE' where category_id=6;

        UPDATE questions SET category_id=1 WHERE category_id=5; -- move "Proposal ESI" questions to "proposal" category
        UPDATE questions SET category_id=2 WHERE category_id=6; -- move "Proposal ESI" questions to "proposal" category

        ALTER TABLE templates ALTER COLUMN group_id SET NOT NULL;
        ALTER TABLE templates DROP COLUMN category_id;

        DELETE FROM active_templates; -- delete, migration of these few rows would be complicated
        ALTER TABLE active_templates DROP COLUMN category_id;
        ALTER TABLE active_templates ADD  COLUMN group_id VARCHAR(30) NOT NULL REFERENCES template_groups(template_group_id) UNIQUE;

    END IF;
END;
$$
LANGUAGE plpgsql;