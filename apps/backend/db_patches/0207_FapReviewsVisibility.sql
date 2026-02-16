DO
$$
BEGIN
    IF register_patch(
        '0207_FapReviewsVisibility.sql',
        'TCMeldrum',
        'Add review visibility column to faps',
        '2026-02-10'
    ) THEN

        ALTER TABLE faps
            ADD COLUMN IF NOT exists review_visibility text;
            
        UPDATE faps
        SET review_visibility = 'proposal_reviews_complete';

        ALTER TABLE proposal_events
            ADD column IF NOT exists call_fap_review_ended BOOLEAN DEFAULT FALSE;

        UPDATE proposal_events SET call_fap_review_ended = 
            (SELECT c.call_fap_review_ended 
                FROM proposals p 
                JOIN CALL c 
                    ON p.call_id = c.call_id
                WHERE p.proposal_pk = proposal_events.proposal_pk);

    END IF;
END;
$$
LANGUAGE plpgsql;
