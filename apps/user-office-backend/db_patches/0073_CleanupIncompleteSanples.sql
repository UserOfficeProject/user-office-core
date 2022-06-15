DO
$$
BEGIN
	IF register_patch('CleanupIncompleteSanples.sql', 'jekabskarklins', 'Clean up incomplete samples and make proposal_id, question_id required', '2020-11-26') THEN
        

                DELETE FROM samples WHERE proposal_id is NULL OR question_id IS NULL;
                
                ALTER TABLE samples ALTER COLUMN proposal_id SET NOT NULL;
                ALTER TABLE samples ALTER COLUMN question_id SET NOT NULL;


	END IF;
END;
$$
LANGUAGE plpgsql;