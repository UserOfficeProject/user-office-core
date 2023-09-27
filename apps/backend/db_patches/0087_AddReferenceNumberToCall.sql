DO
$$
BEGIN
	IF register_patch('AddCallReferenceNumber.sql', 'simonfernandes', 'stfc-user-office-project#5 - Add proposal reference numbers.', '2021-02-04') THEN
	  BEGIN
			ALTER TABLE call ADD COLUMN reference_number_format character varying(64);
			ALTER TABLE call ADD COLUMN proposal_sequence integer;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;