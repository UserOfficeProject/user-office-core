DO
$$
BEGIN
	IF register_patch('RankReviwers.sql', 'Thomas Cottee Meldrum', 'Rank reviewers', '2023-02-09') THEN
	BEGIN
		ALTER TABLE fap_assignments ADD COLUMN rank INTEGER; 

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;