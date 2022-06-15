DO
$$
BEGIN
	IF register_patch('CreateSEPProposals.sql', 'martintrajanovski', 'Create SEP proposals table and modify SEP assignments', '2020-05-20') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "SEP_Proposals" (
      proposal_id int REFERENCES proposals(proposal_id),
      sep_id int REFERENCES "SEPs"(sep_id),
      date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (proposal_id, sep_id)
    );

    ALTER TABLE "SEP_Assignments" DROP CONSTRAINT IF EXISTS "SEP_Assignments_pkey";

    ALTER TABLE "SEP_Assignments" ADD PRIMARY KEY (proposal_id, SEP_member_user_id, sep_id);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;