DO
$$
BEGIN
	IF register_patch('AlterSEPAssgnments.sql', 'martintrajanovski', 'Change of primary key in SEP Assignments', '2020-05-05') THEN
	BEGIN

    DELETE FROM "SEP_Assignments";

    ALTER table "SEP_Assignments" DROP CONSTRAINT IF EXISTS "SEP_Assignments_pkey";

    ALTER TABLE "SEP_Assignments" ALTER COLUMN SEP_member_user_id DROP NOT NULL;

    ALTER TABLE "SEP_Assignments" ADD PRIMARY KEY (proposal_id, sep_id);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
