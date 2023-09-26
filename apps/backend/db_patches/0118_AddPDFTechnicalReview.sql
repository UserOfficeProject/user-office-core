DO
$$
BEGIN
    IF register_patch('AddPDFTechnicalReview.sql', 'Fredrik Bolmsten', 'Add PDF upload to technical review', '2022-03-22') THEN

        ALTER TABLE technical_review
        ADD COLUMN files jsonb;

    END IF;
END;
$$
LANGUAGE plpgsql;