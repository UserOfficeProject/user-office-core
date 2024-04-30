DO
$DO$
BEGIN

  INSERT INTO users(
    user_id, user_title, middlename, firstname, lastname, username, preferredname, oidc_sub, oauth_refresh_token, gender, birthdate, department, "position", email, 
    telephone, telephone_alt, created_at, updated_at, institution_id, nationality, placeholder)
    VALUES (100, '', '1', 'Instrument', 'Scientist1', 'instr.sci1', '-', 'instr.sci1.oauthsub', 'dummy-refresh-token', 'e2e user', '2020-10-10', 'IT', '', 'instr.sci1@local.host', '', '', NOW(), NOW(), 1, 169, false);

  INSERT INTO users(
    user_id, user_title, middlename, firstname, lastname, username, preferredname, oidc_sub, oauth_refresh_token, gender, birthdate, department, "position", email, 
    telephone, telephone_alt, created_at, updated_at, institution_id, nationality, placeholder)
    VALUES (101, '', '2', 'Instrument', 'Scientist2', 'instr.sci2',  '-', 'instr.sci2.oauthsub', 'dummy-refresh-token', 'e2e user', '2020-10-10', 'IT', '', 'instr.sci2@local.host', '', '', NOW(), NOW(), 1, 169, false);

  -- user account with every roles except instrument scientist and user officer
  INSERT INTO users(
    user_id, user_title, middlename, firstname, lastname, username, preferredname, oidc_sub, oauth_refresh_token, gender, birthdate, department, "position", email, 
    telephone, telephone_alt, created_at, updated_at, institution_id, nationality, placeholder)
    VALUES (102, '', 'Instrument', 'Not', 'Scientist', 'not.instr.sci', '-', 'not.instr.sci.oauthsub', 'dummy-refresh-token', 'e2e user', '2020-10-10', 'IT', '', 'not.instr.sci@local.host', '', '', NOW(), NOW(), 1, 169, false);

  INSERT INTO role_user(
    role_id, user_id)
    VALUES (7, 100), (7, 101);

  INSERT INTO instrument_has_scientists(
    instrument_id, user_id)
    VALUES (1, 100);

  INSERT INTO role_user(
    role_id, user_id)
    VALUES (1, 102), (4, 102), (5, 102), (6, 102), (8, 102);

  INSERT INTO instrument_has_scientists(
    instrument_id, user_id)
    VALUES (2, 101);

END;
$DO$
LANGUAGE plpgsql;
