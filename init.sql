CREATE TABLE users (
  user_id  serial PRIMARY KEY
, firstname     varchar(20) NOT NULL
, lastname     varchar(20) NOT NULL
, username     varchar(20) UNIQUE
, password     varchar(60) NOT NULL
);

CREATE TABLE proposals (
  proposal_id serial PRIMARY KEY  -- implicit primary key constraint
, title    varchar(20)
, abstract    text
, status      numeric NOT NULL DEFAULT 0
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


insert into roles (short_code, title) VALUES ('user', 'User');

insert into roles (short_code, title) VALUES ('user_officer', 'User Officer');

insert into users (firstname, lastname, username, password ) VALUES ('Carl', 'Carlsson', 'caca', 'Test1234!');
