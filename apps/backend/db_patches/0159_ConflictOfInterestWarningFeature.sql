DO
$$
BEGIN
  IF register_patch('0159_ConflictOfInterestWarningFeature.sql', 'TCMeldrum', 'Conflict Of Interest Warning Feature', '2024-07-17') THEN
    BEGIN

      INSERT INTO features(feature_id, description) VALUES ('CONFLICT_OF_INTEREST_WARNING', 'Show the conflict of interest Warning when assigning reviewers');


    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
