DO
$$
BEGIN
	IF register_patch('AddBeamlineManagerToInstrumentsTable.sql', 'jekabskarklins', 'Add responsible person named Beamline manager for each instrument', '2021-04-28') THEN

        ALTER TABLE instruments ADD COLUMN manager_user_id INTEGER NOT NULL REFERENCES users (user_id) DEFAULT 0;
		ALTER TABLE instruments ALTER COLUMN manager_user_id DROP DEFAULT;

	END IF;
END;
$$
LANGUAGE plpgsql;