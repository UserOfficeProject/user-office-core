DO
$$
BEGIN
  IF register_patch('AllowSecsEditTechReview.sql', 'TCMeldrum', 'Allow Fap Secretaries to Edit Tech Reviews', '2024-10-07') THEN
    BEGIN

      INSERT INTO settings(settings_id, description) 
        VALUES ('SECS_EDIT_TECH_REVIEWS', 
                'Allows Fap secretaries to edit technical reviews'
                );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
