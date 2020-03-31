CREATE TABLE IF NOT EXISTS "SEPs" (
  sep_id serial PRIMARY KEY,
  description varchar,
  code varchar,
  number_ratings_required int DEFAULT 2,
  active boolean
);

CREATE TABLE IF NOT EXISTS "SEP_Assignments" (
  proposal_id int NOT NULL REFERENCES proposals(proposal_id),
  SEP_member_user_id int REFERENCES users(user_id),
  sep_id int,
  date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reassigned boolean,
  date_reassigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_sent boolean,
  PRIMARY KEY (proposal_id, SEP_member_user_id)
);

CREATE TABLE IF NOT EXISTS "SEP_Ratings" (
  rating_id serial PRIMARY KEY,
  SEP_member_user_id int REFERENCES users(user_id),
  proposal_id int REFERENCES proposals(proposal_id),
  sep_id int,
  rating numeric,
  comments varchar,
  date_rated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE proposals ADD COLUMN sep_id int;
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS sep_id,
ADD CONSTRAINT sep_id FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id) ON DELETE CASCADE;

ALTER TABLE role_user ADD COLUMN sep_id int;
ALTER TABLE role_user DROP CONSTRAINT IF EXISTS sep_id,
ADD CONSTRAINT sep_id FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id) ON DELETE CASCADE;

ALTER TABLE "SEP_Assignments" ADD FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id);

ALTER TABLE "SEP_Ratings" ADD FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id);

INSERT INTO roles (short_code, title) VALUES ('SEP_Chair', 'SEP Chair');

INSERT INTO roles (short_code, title) VALUES ('SEP_Secretary', 'SEP Secretary');

INSERT INTO roles (short_code, title) VALUES ('SEP_Member', 'SEP Member');