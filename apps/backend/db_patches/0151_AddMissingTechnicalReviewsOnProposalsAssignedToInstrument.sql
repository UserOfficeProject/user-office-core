DO
$$
BEGIN
    IF register_patch('0151_AddMissingTechnicalReviewsOnProposalsAssignedToInstrument.sql', 'martintrajanovski', 'Add missing technical reviews on proposals that are already assigned to an instrument', '2024-03-25') THEN

    INSERT INTO technical_review (proposal_pk, instrument_id, reviewer_id, technical_review_assignee_id)
    SELECT proposal_pk, ihs.instrument_id, i.manager_user_id reviewer_id, i.manager_user_id technical_review_assignee_id
    FROM instrument_has_proposals ihs
    JOIN instruments i ON ihs.instrument_id = i.instrument_id
    WHERE NOT EXISTS (SELECT * FROM technical_review WHERE proposal_pk = ihs.proposal_pk);

    END IF;
END;
$$
LANGUAGE plpgsql;