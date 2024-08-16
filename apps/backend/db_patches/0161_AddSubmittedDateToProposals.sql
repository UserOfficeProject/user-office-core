DO
$$
BEGIN
    IF register_patch('AddSubmittedDateToProposals.sql', 'Simon & Deepak', 'Add submitted date coloumn to proposals table', '2024-08-16') THEN
        BEGIN

            ALTER TABLE proposals ADD COLUMN submitted_date TIMESTAMPTZ DEFAULT NULL;
        
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;