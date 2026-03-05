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
            visibility VARCHAR(100) NOT NULL,
            description TEXT
        );

        INSERT INTO review_visibility(visibility, description) VALUES('proposal_reviews_complete', 'Reviews are visible once all proposal reviews are complete');
        INSERT INTO review_visibility(visibility, description) VALUES('reviews_visible', 'Reviews are visible during the FAP review period');
        INSERT INTO review_visibility(visibility, description) VALUES('reviews_visible_fap_ended', 'Reviews are visible after the FAP review period has ended');

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
