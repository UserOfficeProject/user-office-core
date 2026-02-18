DO
$$
BEGIN
    IF register_patch(
        '0207_FapReviewsVisibility.sql',
        'TCMeldrum',
        'Add review visibility column to faps',
        '2026-02-10'
    ) THEN

        CREATE TABLE IF NOT EXISTS review_visibility (
            review_visibility_id  serial PRIMARY KEY,
            visibility VARCHAR(100) NOT NULL
        );

        INSERT INTO review_visibility(visibility) VALUES('proposal_reviews_complete');
        INSERT INTO review_visibility(visibility) VALUES('reviews_visible');
        INSERT INTO review_visibility(visibility) VALUES('reviews_visible_fap_ended');

        ALTER TABLE faps
            ADD COLUMN IF NOT exists review_visibility INT NOT NULL REFERENCES review_visibility(review_visibility_id) DEFAULT 1;
            
        UPDATE faps
        SET review_visibility = 1;

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
