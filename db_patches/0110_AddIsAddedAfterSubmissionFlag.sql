DO
$$
BEGIN
    IF register_patch('AddIsAddedAfterSubmissionFlag.sql', 'Jekabs Karklins', 'Adding flag to samples table to indicate if the sample has been added after proposal is submitted, i.e. during ESI fill out phase', '2021-10-14') THEN

        ALTER TABLE 
            samples 
        ADD COLUMN 
            is_post_proposal_submission BOOLEAN default FALSE;

    END IF;
END;
$$
LANGUAGE plpgsql;