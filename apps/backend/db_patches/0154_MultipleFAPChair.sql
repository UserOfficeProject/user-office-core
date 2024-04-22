DO
$$
BEGIN
	IF register_patch('MultipleFAPChair.sql', 'Thomas Cottee Meldrum', 'Multiple FAP Chair', '2023-01-19') THEN
	BEGIN

		CREATE TABLE "fap_chairs" (
				user_id  int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
			, fap_id int NOT NULL REFERENCES "faps"(fap_id) ON DELETE CASCADE
			, PRIMARY KEY (user_id, fap_id)
		);

		INSERT INTO fap_chairs (SELECT fap_chair_user_id, fap_id FROM faps WHERE fap_chair_user_id IS NOT NULL);

		ALTER TABLE faps DROP COLUMN fap_chair_user_id;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;