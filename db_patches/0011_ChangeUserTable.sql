DO
$$
BEGIN
	IF register_patch('ChangeUserTable.sql', 'fredrikbolmsten', 'link new columns to user table', '2019-11-26') THEN
	BEGIN


		ALTER TABLE users DROP COLUMN organisation_address;
		ALTER TABLE users DROP COLUMN nationality;
		ALTER TABLE users DROP COLUMN organisation;

		ALTER TABLE users ADD COLUMN organisation INTEGER REFERENCES institutions (institution_id);

		ALTER TABLE users ADD COLUMN nationality INTEGER REFERENCES nationalities (nationality_id);



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
