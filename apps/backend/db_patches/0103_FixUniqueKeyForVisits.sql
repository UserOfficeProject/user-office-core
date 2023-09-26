DO
$$
BEGIN
	IF register_patch('FixUniqueKeyForVisits.sql', 'Jekabs Karklins', 'Fix UNIQUE constraint for the visit table', '2021-08-02') THEN
		BEGIN
			DROP INDEX visits_proposal_pk;
			ALTER TABLE visits add CONSTRAINT visits_scheduled_event_id UNIQUE (scheduled_event_id);
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
