DO
$$
BEGIN
	IF register_patch('AddTechnicalReviewSubmittedFlag.sql', 'martintrajanovski', 'Add submitted flag in technical_review', '2020-02-10') THEN
	BEGIN
      ALTER TABLE technical_review ADD COLUMN submitted BOOLEAN DEFAULT FALSE;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;