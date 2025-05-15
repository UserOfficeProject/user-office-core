DO
$$
BEGIN
	IF register_patch('0180_MarkInstrumentsAsUnselectable.sql', 'TCMeldrum', 'Mark instruments as unselecable for instrument picker', '2025-05-25') THEN
	BEGIN

    ALTER TABLE instruments
    ADD COLUMN selectable boolean DEFAULT true; 

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
