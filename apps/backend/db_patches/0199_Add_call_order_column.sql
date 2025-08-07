DO
$$
BEGIN
	IF register_patch('AddCallOrderColumn.sql', 'ellenwright', 'Add call sort order column for manual call ordering', '2025-06-27') THEN
        BEGIN
    	ALTER TABLE call 
            ADD COLUMN sort_order INTEGER
            DEFAULT 0;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;