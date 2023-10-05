DO
$$
BEGIN
	IF register_patch('AlterReviewsTable.sql', 'martintrajanovski', 'Change the name to SEP_Reviews and add some columns', '2020-06-03') THEN
	BEGIN

    ALTER TABLE reviews
    RENAME TO "SEP_Reviews";

    DROP TABLE IF EXISTS "SEP_Ratings";

    ALTER TABLE "SEP_Reviews"
	  ADD COLUMN sep_id INTEGER REFERENCES "SEPs"(sep_id);

    UPDATE roles
    SET short_code = 'SEP_Reviewer',
        title = 'SEP Reviewer'
    WHERE short_code = 'SEP_Member';

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;