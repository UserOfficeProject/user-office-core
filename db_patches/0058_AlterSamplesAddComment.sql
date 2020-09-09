

DO
$$
BEGIN
	IF register_patch('AlterSamplesAddComment.sql', 'jekabskarklins', 'Add new column comment', '2020-09-08') THEN
    BEGIN
        ALTER TABLE samples RENAME COLUMN status TO safety_status;
        ALTER TABLE samples ADD COLUMN safety_comment TEXT DEFAULT '';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;