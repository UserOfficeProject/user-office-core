DO
$DO$
BEGIN

  INSERT INTO instruments (instrument_id, name, short_code, description, manager_user_id) VALUES (1, 'Instrument 1', 'INSTR1', 'Test instrument 1', 0);
  INSERT INTO instruments (instrument_id, name, short_code, description, manager_user_id) VALUES (2, 'Instrument 2', 'INSTR2', 'Test instrument 2', 0);
  INSERT INTO instruments (instrument_id, name, short_code, description, manager_user_id) VALUES (3, 'Instrument 3', 'INSTR3', 'Test instrument 3', 0);
  
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time, submitted) VALUES (1, 1, NULL, false);
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time, submitted) VALUES (1, 3, NULL, false);

  INSERT INTO questionaries(template_id, created_at, creator_id) VALUES (1, NOW(), 1);

  INSERT INTO proposals 
    (
       title
     , abstract
     , status_id
     , proposer_id
     , created_at
     , updated_at
     , proposal_id
     , final_status
     , call_id
     , questionary_id
     , comment_for_management
     , comment_for_user
     , notified
     , submitted
    )
    VALUES 
    (
       'Test proposal'    -- title
     , 'Lorem ipsum'      -- abstract
     , 8                  -- status_id
     , 1                  -- proposer_id
     , NOW()              -- created_at
     , NOW()              -- updated_at
     , '999999'           -- proposal_id
     , 1                  -- final_status
     , 1                  -- call_id
     , 1                  -- questionary_id
     , NULL               -- comment_for_management
     , NULL               -- comment_for_user
     , true               -- notified
     , true               -- submitted
    );

  INSERT INTO instrument_has_proposals(instrument_id, proposal_pk) VALUES (1, 1);

  INSERT INTO technical_review (technical_review_id, proposal_pk, comment, time_allocation, status, public_comment, reviewer_id) VALUES (1, 1, '', 2, 0, '', 0);

END;
$DO$
LANGUAGE plpgsql;
