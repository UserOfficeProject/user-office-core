DO
$$
BEGIN
	IF register_patch('InsertInternalEditableSubmittedToProposalStatuses.sql', 'Farai Mutambara', 'Insert internal editable submitted into Proposal Statuses table', '2022-08-22') THEN
    BEGIN
        
        INSERT INTO proposal_statuses (name, description, short_code) VALUES ('EDITABLE_SUBMITTED_INTERNAL', 'Proposal is editable after submission by internal users only.', 'EDITABLE_SUBMITTED_INTERNAL');
    
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;