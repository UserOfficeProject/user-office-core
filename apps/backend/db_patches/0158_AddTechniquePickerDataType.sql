DO
$$
BEGIN
	IF register_patch('AddTechniquePickerDataType.sql', 'Simon Fernandes, Deepak Jaison', 'Adding Technique Picker type', '2024-06-26') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('TECHNIQUE_PICKER');

	CREATE TABLE IF NOT EXISTS technique_has_proposals (
        technique_id integer NOT NULL REFERENCES techniques (technique_id) ON UPDATE CASCADE ON DELETE CASCADE,
        proposal_id integer NOT NULL REFERENCES  proposals (proposal_id) ON UPDATE CASCADE ON DELETE CASCADE,
        PRIMARY KEY (technique_id, proposal_id)
    );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
