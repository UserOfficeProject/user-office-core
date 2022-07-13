DO
$$
BEGIN
    IF register_patch('AddProposalFilterFeatureId.sql', 'Vyshnavi Doddi', 'Add Proposal Filter to control default proposal filters ', '2022-07-13') THEN

        INSERT INTO features(feature_id, description) VALUES ('PROPOSAL_FILTER', 'Proposal filter feature');

    END IF;
END;
$$
LANGUAGE plpgsql;