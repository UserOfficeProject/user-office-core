DO
$$
BEGIN
	IF register_patch('MigrateReviewsData.sql', 'martintrajanovski', 'Migrate existing reviews to new structure', '2020-06-09') THEN
	BEGIN

    WITH inserted as (
        INSERT INTO
        "SEPs" (description, code, number_ratings_required, active)
        VALUES ('DEMAX scientific evaluation panel', 'DEMAX', 2, true)
        RETURNING "SEPs"."sep_id"
    )

    UPDATE "SEP_Reviews"
    SET sep_id = (SELECT sep_id FROM inserted)
    WHERE sep_id IS NULL;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;