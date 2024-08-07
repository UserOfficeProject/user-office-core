DO
$$
BEGIN
  IF register_patch('0160_OptionalTechReviewsSetting.sql', 'TCMeldrum', 'Optional Technical Reviews Setting', '2024-07-17') THEN
    BEGIN

      INSERT INTO settings(settings_id, description) 
        VALUES ('TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS', 
                'Workflow status that if included a technical review will be created. Leave empty for all proposals to get tech reviews'
                );

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
