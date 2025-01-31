DO
$DO$
DECLARE  
  questionary_id_var int;
  technical_review_template_id_var int;
  technical_review_questionary_id_var int;
BEGIN

  INSERT INTO instruments (instrument_id, name, short_code, description, manager_user_id) VALUES (1, 'Instrument 1', 'INSTR1', 'Test instrument 1', 0);
  INSERT INTO instruments (instrument_id, name, short_code, description, manager_user_id) VALUES (2, 'Instrument 2', 'INSTR2', 'Test instrument 2', 0);
  INSERT INTO instruments (instrument_id, name, short_code, description, manager_user_id) VALUES (3, 'Instrument 3', 'INSTR3', 'Test instrument 3', 0);

  INSERT INTO techniques (technique_id, name, short_code, description) VALUES (1, 'Technique 1', 'TECH1', 'Test technique 1');
  INSERT INTO techniques (technique_id, name, short_code, description) VALUES (2, 'Technique 2', 'TECH2', 'Test technique 2');
  INSERT INTO techniques (technique_id, name, short_code, description) VALUES (3, 'Technique 3', 'TECH3', 'Test technique 3');
  
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time) VALUES (1, 1, NULL);
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time) VALUES (1, 3, NULL);

  INSERT INTO technique_has_instruments (technique_id, instrument_id) VALUES (1, 1);
  INSERT INTO technique_has_instruments (technique_id, instrument_id) VALUES (1, 3);

  INSERT INTO technique_has_instruments (technique_id, instrument_id) VALUES (2, 1);
  INSERT INTO technique_has_instruments (technique_id, instrument_id) VALUES (2, 3);

  INSERT INTO questionaries(template_id, created_at, creator_id) VALUES (1, NOW(), 1);

  SELECT questionaries.questionary_id
  INTO questionary_id_var
  FROM questionaries
  WHERE template_id = 1;

  SELECT templates.template_id 
  INTO technical_review_template_id_var
  FROM templates
  WHERE name = 'default technical review template';

  INSERT INTO questionaries(template_id, created_at, creator_id) VALUES (technical_review_template_id_var, NOW(), 1);

  SELECT questionaries.questionary_id
  INTO technical_review_questionary_id_var
  FROM questionaries
  WHERE template_id = technical_review_template_id_var; 

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
     , questionary_id_var -- questionary_id
     , NULL               -- comment_for_management
     , NULL               -- comment_for_user
     , true               -- notified
     , true               -- submitted
    );

  INSERT INTO instrument_has_proposals(instrument_id, proposal_pk) VALUES (1, 1);

  INSERT INTO technical_review(technical_review_id, proposal_pk, comment, time_allocation, status, public_comment, reviewer_id, technical_review_assignee_id, instrument_id, questionary_id) 
  VALUES (1, 1, '', 2, 0, '', 0, 0, 1, technical_review_questionary_id_var);

END;
$DO$
LANGUAGE plpgsql;
