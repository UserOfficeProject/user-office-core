DO
$DO$
BEGIN

  INSERT INTO users(
    user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, 
    email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder)
    VALUES (100, '', '1', 'Instrument', 'Scientist', 'instr.sci1', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', '-', '99999', '', 'e2e user', '2020-10-10', 'IT', '', 'instr.sci1@local.host', true, '', '', NOW(), NOW(), 1, 169, false);

  INSERT INTO users(
    user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, 
    email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder)
    VALUES (101, '', '2', 'Instrument', 'Scientist', 'instr.sci2', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', '-', '99999', '', 'e2e user', '2020-10-10', 'IT', '', 'instr.sci2@local.host', true, '', '', NOW(), NOW(), 1, 169, false);

  -- user account with every roles except instrument scientist and user officer
  INSERT INTO users(
    user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, 
    email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder)
    VALUES (102, '', 'Instrument', 'Not', 'Scientist', 'not.instr.sci', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', '-', '99999', '', 'e2e user', '2020-10-10', 'IT', '', 'not.instr.sci@local.host', true, '', '', NOW(), NOW(), 1, 169, false);

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
