DO
$$
BEGIN
	IF register_patch('MultipleFAPSecretary.sql', 'Thomas Cottee Meldrum', 'Multiple FAP Secretary', '2023-01-19') THEN
	BEGIN

		CREATE TABLE "fap_secretaries" (
				user_id  int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
			, fap_id int NOT NULL REFERENCES "faps"(fap_id) ON DELETE CASCADE
			, PRIMARY KEY (user_id, fap_id)
		);

		INSERT INTO fap_secretaries (SELECT fap_secretary_user_id, fap_id FROM faps WHERE fap_secretary_user_id IS NOT NULL);

		ALTER TABLE faps DROP COLUMN fap_secretary_user_id;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;