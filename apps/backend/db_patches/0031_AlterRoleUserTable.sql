DO
$$
BEGIN
	IF register_patch('AlterRoleUserTable.sql', 'martintrajanovski', 'Change of primary key in role_user', '2020-05-12') THEN
	BEGIN

    ALTER TABLE "role_user" DROP CONSTRAINT IF EXISTS "role_user_pkey";

    ALTER TABLE "role_user" ADD COLUMN "role_user_id" serial PRIMARY KEY ;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;