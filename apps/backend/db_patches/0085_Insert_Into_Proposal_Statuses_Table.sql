

DO
$$
BEGIN
	IF register_patch('Insert_Into_Proposal_Statuses_Table.sql', 'David Symons', 'Add additional Status into Proposal Statuses table', '2021-03-19') THEN
    BEGIN
        
        INSERT INTO proposal_statuses (name, description, short_code) VALUES ('EDITABLE_SUBMITTED', 'Proposal is editable after submission.', 'EDITABLE_SUBMITTED');
    
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;