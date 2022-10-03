DO
$$
BEGIN
	IF register_patch('RenameToSafetyReviewRole.sql', 'jekabskarklins', 'Rename role to Safety Reviewer', '2022-09-22') THEN
	BEGIN

    UPDATE 
      roles
    SET 
      short_code='safety_reviewer', title='Safety reviewer'
    WHERE 
      short_code='sample_safety_reviewer';

    UPDATE
      features
    SET
      feature_id='SAFETY'
    WHERE
      feature_id='SAMPLE_SAFETY';
      
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;