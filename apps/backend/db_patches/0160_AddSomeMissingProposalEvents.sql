DO
$$
BEGIN
    IF register_patch('0160_AddSomeMissingProposalEvents', 'martintrajanovski', 'Add missing proposal FAP events', '2024-08-05') THEN

        ALTER TABLE proposal_events ADD COLUMN fap_all_meetings_submitted BOOLEAN DEFAULT FALSE;
        ALTER TABLE proposal_events ADD COLUMN proposal_all_fap_meetings_submitted BOOLEAN DEFAULT FALSE;
        ALTER TABLE proposal_events ADD COLUMN proposal_all_fap_reviews_submitted_for_all_panels BOOLEAN DEFAULT FALSE;

    END IF;
END;
$$
LANGUAGE plpgsql;