drop table IF EXISTS users;
drop table IF EXISTS proposals;
drop table IF EXISTS proposal_questions;
drop table IF EXISTS proposal_answers;
drop table IF EXISTS proposal_question_datatypes;
drop table IF EXISTS proposal_question_dependencies;
drop table IF EXISTS proposal_users;
drop table IF EXISTS roles;
drop table IF EXISTS role_users;
drop table IF EXISTS reviews;


CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  user_id  serial PRIMARY KEY
, user_title       varchar(5) DEFAULT NULL
, middlename    varchar(20) DEFAULT NULL
, firstname     varchar(20) NOT NULL
, lastname     varchar(20) NOT NULL
, username     varchar(20) UNIQUE
, password     varchar(100) NOT NULL
, preferredname varchar(20) DEFAULT NULL
, orcid       varchar(100) NOT NULL
, gender      varchar(12) NOT NULL
, nationality varchar(30) NOT NULL
, birthdate   DATE NOT NULL
, organisation varchar(50) NOT NULL
, department varchar(60) NOT NULL
, organisation_address varchar(100) NOT NULL
, position  varchar(30) NOT NULL
, email     varchar(30) UNIQUE
, telephone varchar(20) NOT NULL
, telephone_alt varchar(20) DEFAULT NULL
, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE proposals (
  proposal_id serial PRIMARY KEY  -- implicit primary key constraint
, title    varchar(20)
, abstract    text
, status      int NOT NULL DEFAULT 0
, proposer_id int REFERENCES users (user_id)
, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE proposal_question_datatypes (
  proposal_question_datatype_id  VARCHAR(64) PRIMARY KEY
);

CREATE TABLE proposal_questions (
  proposal_question_id  VARCHAR(64) PRIMARY KEY   /* f.x.links_with_industry */
, data_type             VARCHAR(64) NOT NULL REFERENCES proposal_question_datatypes(proposal_question_datatype_id)
, question              VARCHAR(256) NOT NULL
, config                VARCHAR(512) DEFAULT NULL              /* f.x. { "min":2, "max":50 } */
, created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
, updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON proposal_questions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE proposal_answers (
  proposal_id           INTEGER NOT NULL REFERENCES proposals(proposal_id)
, proposal_question_id  VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
, answer                VARCHAR(512) 
, created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
, PRIMARY KEY (proposal_id, proposal_question_id)
);

CREATE TABLE proposal_question_dependencies (
  proposal_question_id          VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
, proposal_question_dependency  VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
, conditions                    VARCHAR(64) DEFAULT NULL
, PRIMARY KEY (proposal_question_id, proposal_question_dependency)
);

CREATE TABLE proposal_user (
  proposal_id    int REFERENCES proposals (proposal_id) ON UPDATE CASCADE
, user_id int REFERENCES users (user_id) ON UPDATE CASCADE
, CONSTRAINT proposal_user_pkey PRIMARY KEY (proposal_id, user_id)  -- explicit pk
);

CREATE TABLE roles (
  role_id  serial PRIMARY KEY
, short_code     varchar(20) NOT NULL
, title     varchar(20) NOT NULL
);


CREATE TABLE role_user (
  role_id int REFERENCES roles (role_id) ON UPDATE CASCADE
, user_id int REFERENCES users (user_id) ON UPDATE CASCADE
, CONSTRAINT role_user_pkey PRIMARY KEY (role_id, user_id)  -- explicit pk
);


INSERT INTO roles (short_code, title) VALUES ('user', 'User');

INSERT INTO roles (short_code, title) VALUES ('user_officer', 'User Officer');

INSERT INTO users (
                  user_title, 
                  firstname, 
                  middlename, 
                  lastname, 
                  username, 
                  password,
                  preferredname,
                  orcid,
                  gender,
                  nationality,
                  birthdate,
                  organisation,
                  department,
                  organisation_address,
                  position,
                  email,
                  telephone,
                  telephone_alt
                  ) 
VALUES 
                (
                  'Mr.', 
                  'Carl',
                  'Christian', 
                  'Carlsson', 
                  'testuser', 
                  '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                  null,
                  '581459604',
                  'male',
                  'Norwegian',
                  '2000-04-02',
                  'Roberts, Reilly and Gutkowski',
                  'IT deparment',
                  'Estonia, New Gabriella, 4056 Cronin Motorway',
                  'Strategist',
                  'Javon4@hotmail.com',
                  '(288) 431-1443',
                  '(370) 386-8976'
                  );

INSERT INTO role_user (role_id, user_id) VALUES (1, 1);


INSERT INTO users (
                  user_title, 
                  firstname, 
                  middlename, 
                  lastname, 
                  username, 
                  password,
                  preferredname,
                  orcid,
                  gender,
                  nationality,
                  birthdate,
                  organisation,
                  department,
                  organisation_address,
                  position,
                  email,
                  telephone,
                  telephone_alt
                  ) 
VALUES (
                'Mr.', 
                'Anders', 
                'Adam',
                'Andersson', 
                'testofficer', 
                '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                'Rhiannon',
                '878321897',
                'male',
                'French',
                '1981-08-05',
                'Pfannerstill and Sons',
                'IT department',
                'Congo, Alleneville, 35823 Mueller Glens',
                'Liaison',
                'Aaron_Harris49@gmail.com',
                '711-316-5728',
                '1-359-864-3489 x7390'
                );

INSERT INTO role_user (role_id, user_id) VALUES (1, 2);

INSERT INTO role_user (role_id, user_id) VALUES (2, 2);

INSERT INTO proposal_question_datatypes VALUES ('SMALL_TEXT');
INSERT INTO proposal_question_datatypes VALUES ('LARGE_TEXT');
INSERT INTO proposal_question_datatypes VALUES ('SELECTION_FROM_OPTIONS');
INSERT INTO proposal_question_datatypes VALUES ('BOOLEAN');
INSERT INTO proposal_question_datatypes VALUES ('DATE');
INSERT INTO proposal_question_datatypes VALUES ('FILE_UPLOAD');

INSERT INTO proposal_questions VALUES ('has_links_with_industry', 'SELECTION_FROM_OPTIONS', 'Links with industry?', '{"variant":"radio", "options":["yes", "no"], "topic":"general_info"}');
INSERT INTO proposal_questions VALUES ('links_with_industry', 'SMALL_TEXT', 'Please specify', '{"max":300, "min":2,"topic":"general_info"}');
INSERT INTO proposal_questions VALUES ('final_delivery_date', 'DATE', 'Final delivery date', '{"topic":"general_info"}');
INSERT INTO proposal_questions VALUES ('final_delivery_date_motivation', 'LARGE_TEXT', 'Please motivate the chosen date', '{"small_label":"(e.g. based on awarded beamtime, or described intention to apply)","topic":"general_info"}');
/* TODO add more questions */

INSERT INTO proposal_question_dependencies VALUES ('links_with_industry', 'has_links_with_industry', '{ "ifValue": "yes" }');