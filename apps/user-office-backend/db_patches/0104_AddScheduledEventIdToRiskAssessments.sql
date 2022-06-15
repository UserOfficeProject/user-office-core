DO
$$
BEGIN
	IF register_patch('AddScheduledEventIdToRiskAssessments.sql', 'Jekabs Karklins', 'Risk assessmenet should be attached to the experiment time', '2021-08-11') THEN
		BEGIN
			DELETE FROM risk_assessments; -- clean up table because of new constraints

			ALTER TABLE risk_assessments ADD COLUMN scheduled_event_id INTEGER NOT NULL;

			ALTER TABLE risk_assessments DROP CONSTRAINT risk_assessments_proposal_pk_key;
			ALTER TABLE risk_assessments ADD CONSTRAINT risk_assessments_proposal_pk_scheduled_event_id_key UNIQUE (proposal_pk, scheduled_event_id);
		
			CREATE TABLE risk_assessments_has_samples (
				risk_assessment_id int REFERENCES risk_assessments(risk_assessment_id) ON DELETE CASCADE
				, sample_id int REFERENCES samples(sample_id) ON DELETE CASCADE
			); 

		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
