DO
$$
BEGIN
	IF register_patch('AddSEPsTables.sql', 'martintrajanovski', 'Logging', '2020-03-29') THEN
	BEGIN



    CREATE TABLE IF NOT EXISTS "SEPs" (
      sep_id serial PRIMARY KEY,
      description varchar,
      code varchar,
      number_ratings_required int DEFAULT 2,
      active boolean
    );

    CREATE TABLE IF NOT EXISTS "SEP_Assignments" (
      proposal_id int REFERENCES proposals(proposal_id),
      SEP_member_user_id int REFERENCES users(user_id),
      sep_id int REFERENCES "SEPs"(sep_id),
      date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reassigned boolean DEFAULT false,
      date_reassigned TIMESTAMPTZ DEFAULT null,
      email_sent boolean DEFAULT false,
      PRIMARY KEY (sep_id, SEP_member_user_id)
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
    ADD CONSTRAINT sep_id FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id) ON DELETE CASCADE,
    ADD CONSTRAINT role_user_sep_unique_idx UNIQUE (role_id, user_id, sep_id);

    CREATE UNIQUE INDEX role_user_unique_idx ON role_user (role_id, user_id) WHERE sep_id IS NULL;

    ALTER TABLE "SEP_Assignments" ADD FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id);

    ALTER TABLE "SEP_Ratings" ADD FOREIGN KEY (sep_id) REFERENCES "SEPs" (sep_id);

    INSERT INTO roles (short_code, title) VALUES ('SEP_Chair', 'SEP Chair');

    INSERT INTO roles (short_code, title) VALUES ('SEP_Secretary', 'SEP Secretary');

    INSERT INTO roles (short_code, title) VALUES ('SEP_Member', 'SEP Member');




    END;
	END IF;
END;
$$
LANGUAGE plpgsql;