DO
$$
BEGIN
	IF register_patch('0183_EnableInstrumentsForMultipleTechReviews.sql', 'Bhaswati Dey', 'Enabling instruments for multiple tech reviews', '2025-06-24') THEN
	BEGIN

    ALTER TABLE instruments
    ADD COLUMN multiple_tech_reviews_enabled boolean DEFAULT false; 

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
