DO
$DO$
BEGIN

  INSERT INTO users(
    user_id, user_title, firstname, lastname, preferredname, oidc_sub, oauth_refresh_token, email, created_at, updated_at, institution_id
  )
    VALUES (100, '', 'Instrument', 'Scientist1', '-', 'instr.sci1.oauthsub', 'dummy-refresh-token', 'instr.sci1@local.host', NOW(), NOW(), 1);

  INSERT INTO users(
    user_id, user_title, firstname, lastname, preferredname, oidc_sub, oauth_refresh_token, email, created_at, updated_at, institution_id
  )
    VALUES (101, '', 'Instrument', 'Scientist2', '-', 'instr.sci2.oauthsub', 'dummy-refresh-token', 'instr.sci2@local.host', NOW(), NOW(), 1);

  -- user account with every roles except instrument scientist and user officer
  INSERT INTO users(
    user_id, user_title, firstname, lastname, preferredname, oidc_sub, oauth_refresh_token, email, created_at, updated_at, institution_id
  )
    VALUES (102, '', 'Not', 'Scientist', '-', 'not.instr.sci.oauthsub', 'dummy-refresh-token', 'not.instr.sci@local.host', NOW(), NOW(), 1);

  -- user account with experiment safety reviewer
  INSERT INTO users(
    user_id, user_title, firstname, lastname, username, preferredname, oidc_sub, oauth_refresh_token, gender, birthdate, department, "position", email, 
    telephone, created_at, updated_at, institution_id, placeholder)
    VALUES (103, '', 'Experiment', 'Safety', 'experiment.safety', '-', 'experiment.safety.oauthsub', 'dummy-refresh-token', 'e2e user', '2020-10-10', 'IT', '', 'experiment.safety@local.host', '', NOW(), NOW(), 1, false);

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

  INSERT INTO role_user(
    role_id, user_id)
    VALUES (8, 103);

END;
$DO$
LANGUAGE plpgsql;
