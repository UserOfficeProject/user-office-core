DO
$$
DECLARE
  rec           RECORD;
  v_invite_id   INT;
  v_email       VARCHAR;
  v_created_by  INT;
  v_role_id     INT;
  v_proposal_pk INT;
BEGIN
  IF register_patch(
       '0171_MigrateRedeemCodesToInvites',
       'Jekabs Karklins',
       'Migrate existing Redeem codes into Invites system',
       '2025-02-04'
     ) THEN

    -- Loop through each redeem code record
    FOR rec IN SELECT * FROM redeem_codes LOOP
      BEGIN
        -- Retrieve email from the users table using placeholder_user_id
        SELECT email
          INTO v_email
          FROM users
         WHERE user_id = rec.placeholder_user_id;
         
        IF v_email IS NULL THEN
          RAISE NOTICE 'Skipping redeem code %: no email found for user %', rec.code, rec.placeholder_user_id;
          CONTINUE;
        END IF;
        
        -- Determine created_by; if null, default to 1
        v_created_by := COALESCE(rec.created_by, 1);
        
        -- Insert a new invite record and retrieve the generated invite_id
        INSERT INTO invites (code, email, created_by, created_at, claimed_by, claimed_at)
        VALUES (rec.code, v_email, v_created_by, rec.created_at, rec.claimed_by, rec.claimed_at)
        RETURNING invite_id INTO v_invite_id;
        
        -- Migrate role claims: for each role attached to the user, create a role_claims record
        FOR v_role_id IN
          SELECT role_id
          FROM role_user
          WHERE user_id = rec.placeholder_user_id
        LOOP
          INSERT INTO role_claims (invite_id, role_id)
          VALUES (v_invite_id, v_role_id);
        END LOOP;
        
        -- Migrate co-proposer claims: for each proposal the user is part of, create a co_proposer_claims record
        FOR v_proposal_pk IN
          SELECT proposal_pk
          FROM proposal_user
          WHERE user_id = rec.placeholder_user_id
        LOOP
          INSERT INTO co_proposer_claims (invite_id, proposal_pk)
          VALUES (v_invite_id, v_proposal_pk);
        END LOOP;
        
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Error processing redeem code %: %', rec.code, SQLERRM;
          -- Continue with the next redeem code in case of error
      END;
    END LOOP;
    
  END IF;
END;
$$
LANGUAGE plpgsql;
