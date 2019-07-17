CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  user_id  serial PRIMARY KEY
, firstname     varchar(20) NOT NULL
, lastname     varchar(20) NOT NULL
, username     varchar(20) UNIQUE
, password     varchar(100) NOT NULL
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
, status      numeric NOT NULL DEFAULT 0
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


insert into roles (short_code, title) VALUES ('user', 'User');

insert into roles (short_code, title) VALUES ('user_officer', 'User Officer');

insert into users (firstname, lastname, username, password ) VALUES ('Carl', 'Carlsson', 'testuser', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm');

insert into role_user (role_id, user_id) VALUES (1, 1);


insert into users (firstname, lastname, username, password ) VALUES ('Anders', 'Andersson', 'testofficer', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm');

insert into role_user (role_id, user_id) VALUES (1, 2);

insert into role_user (role_id, user_id) VALUES (2, 2);