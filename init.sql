drop table IF EXISTS users;
drop table IF EXISTS proposals;
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


CREATE TABLE reviews (
  review_id serial 
, user_id int REFERENCES users (user_id) ON UPDATE CASCADE
, proposal_id int REFERENCES proposals (proposal_id) ON UPDATE CASCADE
, comment    varchar(500)
, grade      int
, status      int
, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
, CONSTRAINT prop_user_pkey PRIMARY KEY (proposal_id, user_id)  -- explicit pk
);


CREATE TABLE call (
  call_id serial PRIMARY KEY 
, call_short_code varchar(20) NOT NULL
, start_call date NOT NULL
, end_call date NOT NULL
, start_review date NOT NULL
, end_review date NOT NULL
, start_notify date NOT NULL
, end_notify date NOT NULL
, cycle_comment varchar(100) NOT NULL
, survey_comment varchar(100) NOT NULL
);



INSERT INTO roles (short_code, title) VALUES ('user', 'User');

INSERT INTO roles (short_code, title) VALUES ('user_officer', 'User Officer');

INSERT INTO roles (short_code, title) VALUES ('reviewer', 'Reviewer');

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

INSERT INTO role_user (role_id, user_id) VALUES (2, 2);


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
                'Nils', 
                'Adam',
                'Nilsson', 
                'testreviewer', 
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
                'nils@ess.se',
                '711-316-5728',
                '1-359-864-3489 x7390'
                );

INSERT INTO role_user (role_id, user_id) VALUES (3, 3);
