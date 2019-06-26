CREATE TABLE users (
  user_id  serial PRIMARY KEY
, firstname     varchar(20) NOT NULL
, lastname     varchar(20) NOT NULL
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
, title     varchar(20) NOT NULL
);
