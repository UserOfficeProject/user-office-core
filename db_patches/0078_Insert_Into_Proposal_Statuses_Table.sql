

DO
$$
BEGIN
	IF register_patch('Insert_Into_Proposal_Statuses_Table.sql', 'David Symons', 'Add additional Status into Proposal Statuses table', '2021-03-19') THEN
    BEGIN
        
        INSERT INTO proposal_statuses (name, description) VALUES ('EDITABLE_SUBMISSION', 'Proposal is editable after submission.');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;