DO
$$
BEGIN
	IF register_patch('AddCallIdInSEPProposals.sql', 'martintrajanovski', 'Add call_id in SEP_Proposals', '2020-07-16') THEN
	BEGIN

      ALTER TABLE "SEP_Proposals" ADD COLUMN call_id INTEGER;

      UPDATE "SEP_Proposals"
        SET call_id = (
            SELECT call_id 
            FROM proposals 
            WHERE proposal_id = "SEP_Proposals".proposal_id );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;