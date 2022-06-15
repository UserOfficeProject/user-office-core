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

    INSERT INTO "SEP_Proposals"
    (proposal_id, sep_id)
    SELECT DISTINCT proposal_id, sep_id FROM "SEP_Reviews";

    IF EXISTS (SELECT user_id FROM users WHERE email='zoe.fisher@esss.se')
        THEN
            INSERT INTO role_user
            (role_id, user_id, sep_id) VALUES
            (4, (SELECT user_id FROM users WHERE email='zoe.fisher@esss.se'), (SELECT sep_id from "SEPs" where code = 'DEMAX'));

            INSERT INTO role_user
            (role_id, user_id, sep_id) VALUES
            (5, (SELECT user_id FROM users WHERE email='carina.lobley@esss.se'), (SELECT sep_id from "SEPs" where code = 'DEMAX'));

            INSERT INTO role_user
            (role_id, user_id, sep_id)
            SELECT DISTINCT 6, user_id, (SELECT sep_id from "SEPs" where code = 'DEMAX') FROM "SEP_Reviews";

            INSERT INTO "SEP_Assignments"
            (proposal_id, sep_member_user_id, sep_id)
            SELECT DISTINCT proposal_id, user_id, (SELECT sep_id from "SEPs" where code = 'DEMAX') FROM "SEP_Reviews";
    END IF;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;