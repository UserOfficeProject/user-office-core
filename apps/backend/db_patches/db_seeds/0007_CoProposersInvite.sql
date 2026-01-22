DO
$DO$
DECLARE  
  invite_id_var1 int;
  invite_id_var2 int;
  invite_id_var3 int;
  invite_id_var4 int;
BEGIN

  INSERT INTO invites (code, email, created_by, created_at, claimed_by, claimed_at, is_email_sent, expires_at, template_id) 
  VALUES ('DAVE001', 'david@teleworm.us', 1, NOW(), NULL, NULL, false, NULL, 'user-office-registration-invitation-co-proposer');

  SELECT invite_id
  INTO invite_id_var1
  FROM invites
  WHERE email = 'david@teleworm.us' AND code = 'DAVE001';

  INSERT INTO invites (code, email, created_by, created_at, claimed_by, claimed_at, is_email_sent, expires_at, template_id) 
  VALUES ('BEN001', 'ben@inbox.com', 1, NOW(), NULL, NULL, false, NULL, 'user-office-registration-invitation-co-proposer');

  SELECT invite_id
  INTO invite_id_var2
  FROM invites
  WHERE email = 'ben@inbox.com' AND code = 'BEN001';

  INSERT INTO co_proposer_claims (invite_id, proposal_pk) VALUES (invite_id_var1, 1);
  INSERT INTO co_proposer_claims (invite_id, proposal_pk) VALUES (invite_id_var2, 1);

  INSERT INTO invites (code, email, created_by, created_at, claimed_by, claimed_at, is_email_sent, expires_at, template_id) 
  VALUES ('DAVE002', 'david@teleworm.us', 1, NOW(), NULL, NULL, false, NULL, '');

  SELECT invite_id
  INTO invite_id_var3
  FROM invites
  WHERE email = 'david@teleworm.us' AND code = 'DAVE002';

  INSERT INTO invites (code, email, created_by, created_at, claimed_by, claimed_at, is_email_sent, expires_at, template_id) 
  VALUES ('BEN002', 'ben@inbox.com', 1, NOW(), NULL, NULL, false, NULL, '');

  SELECT invite_id
  INTO invite_id_var4
  FROM invites
  WHERE email = 'ben@inbox.com' AND code = 'BEN002';

  INSERT INTO co_proposer_claims (invite_id, proposal_pk) VALUES (invite_id_var3, 2);
  INSERT INTO co_proposer_claims (invite_id, proposal_pk) VALUES (invite_id_var4, 2);

END;
$DO$
LANGUAGE plpgsql;
