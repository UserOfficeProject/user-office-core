DO
$$
BEGIN
	IF register_patch('ExperimentPreparationAlterings.sql', 'jekabskarklins', 'Add column scheduled_event_id to visits table', '2021-06-02') THEN
	BEGIN

		/* visits */
		DELETE FROM visits; /* Delete all existing visits, because visit must have associated event_id */

		ALTER TABLE visits ADD COLUMN scheduled_event_id INTEGER NOT NULL;
		ALTER TABLE visits ADD COLUMN team_lead_user_id INTEGER NOT NULL REFERENCES users(user_id);
		ALTER TABLE visits DROP COLUMN questionary_id;
		ALTER TABLE visits RENAME COLUMN visitor_id TO creator_id;

		CREATE UNIQUE INDEX visits_proposal_pk ON visits (proposal_pk);

		/* visits_has_users */
		ALTER TABLE visits_has_users ADD COLUMN registration_questionary_id INTEGER REFERENCES questionaries(questionary_id) DEFAULT NULL;
		ALTER TABLE visits_has_users ADD COLUMN is_registration_submitted BOOLEAN DEFAULT FALSE;
		ALTER TABLE visits_has_users ADD COLUMN training_expiry_date TIMESTAMPTZ DEFAULT NULL;

		/* proposals */
		ALTER TABLE proposals ADD COLUMN risk_assessment_questionary_id INTEGER REFERENCES questionaries(questionary_id) DEFAULT NULL;

		/* shipments */

		DELETE FROM shipments; /* Delete all existing shipments, because shipment must have associated visit_id */
		ALTER TABLE shipments ADD COLUMN visit_id INTEGER REFERENCES visits(visit_id) NOT NULL;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
