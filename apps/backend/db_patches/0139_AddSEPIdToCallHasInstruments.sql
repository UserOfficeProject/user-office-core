DO
$$
BEGIN
	IF register_patch('AddSEPIdToCallHasInstruments.sql', 'Yoganandan Pandiyan', 'Adding SEP Id to Call Has Instruments', '2023-09-25') THEN
		BEGIN
    	ALTER TABLE call_has_instruments 
			ADD COLUMN sep_id INT REFERENCES "SEPs" (sep_id) ON UPDATE CASCADE ON DELETE CASCADE;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;