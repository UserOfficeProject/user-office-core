DO
$$
BEGIN
  IF register_patch('0157_MakeTechReviewsConfigurableByCall.sql', 'Thomas Cottee Meldrum', 'Make Tech Reviews Configurable By Call', '2024-06-19') THEN
    BEGIN

      ALTER TABLE call
        ADD need_tech_review boolean;

      UPDATE call SET need_tech_review = true;

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
