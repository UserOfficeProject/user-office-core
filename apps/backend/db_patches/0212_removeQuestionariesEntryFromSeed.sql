DO
$$
BEGIN
	IF register_patch('RemoveQuestionariesEntryFromSeed.sql', 'Zachary Hankin', 'Removes entry in questionaries that is left over from initialising db', '2026-06-01') THEN
	BEGIN
        DELETE FROM questionaries
        WHERE questionary_id = 1
        AND template_id = 2
        AND creator_id = 0;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
