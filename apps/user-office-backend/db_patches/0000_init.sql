DO
$DO$
BEGIN
	IF register_patch('init.sql', 'unknown', 'init', '2019-10-01 00:00:00.000000+00') THEN
	BEGIN


    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION file_id_pseudo_encrypt(VALUE bigint) returns bigint AS $$
    DECLARE
    l1 bigint;
    l2 bigint;
    r1 bigint;
    r2 bigint;
    i int:=0;
    BEGIN
        l1:= (VALUE >> 32) & 4294967295::bigint;
        r1:= VALUE & 4294967295;
        WHILE i < 3 LOOP
            l2 := r1;
            r2 := l1 # ((((1366.0 * r1 + 150889) % 714025) / 714025.0) * 32767*32767)::int;
            l1 := l2;
            r1 := r2;
            i := i + 1;
        END LOOP;
    RETURN ((l1::bigint << 32) + r1);
    END;
    $$ LANGUAGE plpgsql strict immutable;


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
    , orcid_refreshToken  varchar(100) NOT NULL
    , gender      varchar(12) NOT NULL
    , nationality varchar(30) NOT NULL
    , birthdate   DATE NOT NULL
    , organisation varchar(50) NOT NULL
    , department varchar(60) NOT NULL
    , organisation_address varchar(100) NOT NULL
    , position  varchar(30) NOT NULL
    , email     varchar(30) UNIQUE
    , email_verified boolean DEFAULT False
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
    , title    varchar(100)
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

    CREATE TABLE proposal_topics (
      topic_id  serial PRIMARY KEY
    , topic_title varchar(32) NOT NULL
    , is_enabled BOOLEAN DEFAULT FALSE
    , sort_order serial NOT NULL
    );

    CREATE TABLE proposal_questions (
      proposal_question_id  VARCHAR(64) PRIMARY KEY   /* f.x.links_with_industry */
    , data_type             VARCHAR(64) NOT NULL REFERENCES proposal_question_datatypes(proposal_question_datatype_id)
    , question              VARCHAR(256) NOT NULL
    , topic_id              INT DEFAULT NULL REFERENCES proposal_topics(topic_id)              /* f.x. { "min":2, "max":50 } */
    , config                VARCHAR(512) DEFAULT NULL              /* f.x. { "min":2, "max":50 } */
    , sort_order            INT DEFAULT 0
    , created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    , updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON proposal_questions
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    CREATE TABLE proposal_answers (
      answer_id             serial UNIQUE
    , proposal_id           INTEGER NOT NULL REFERENCES proposals(proposal_id)
    , proposal_question_id  VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
    , answer                VARCHAR(512) 
    , created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    , PRIMARY KEY (proposal_id, proposal_question_id)
    );

    CREATE TABLE proposal_question_dependencies (
      proposal_question_id          VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id) ON DELETE CASCADE
    , proposal_question_dependency  VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id) ON DELETE CASCADE
    , condition                     VARCHAR(64) DEFAULT NULL
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



    DROP SEQUENCE IF EXISTS files_file_id_seq;
    CREATE SEQUENCE files_file_id_seq;

    CREATE TABLE files (
      file_id            BIGINT PRIMARY KEY default file_id_pseudo_encrypt(nextval('files_file_id_seq'))
    , file_name     VARCHAR(512) NOT NULL
    , size_in_bytes INT
    , mime_type     VARCHAR(64) 
    , oid           INT UNIQUE
    , created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE proposal_answers_files (
      answer_id int REFERENCES proposal_answers (answer_id)
    , file_id  bigint REFERENCES files (file_id)
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


    CREATE TABLE pagetext (
      pagetext_id serial PRIMARY KEY  -- implicit primary key constraint
    , content    text	
    );


    INSERT INTO pagetext (content) values ('HOMEPAGE');

    INSERT INTO pagetext (content) values ('HELPPAGE');

    INSERT INTO roles (short_code, title) VALUES ('user', 'User');

    INSERT INTO roles (short_code, title) VALUES ('user_officer', 'User Officer');

    INSERT INTO roles (short_code, title) VALUES ('reviewer', 'Reviewer');


INSERT INTO users (
                      user_id,
                      user_title, 
                      firstname, 
                      middlename, 
                      lastname, 
                      username, 
                      password,
                      preferredname,
                      orcid,
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
                      telephone,
                      telephone_alt
                      ) 
    VALUES 
                    (
                      0,
                      'Mr.', 
                      'Service account',
                      '', 
                      '', 
                      'service', 
                      '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                      'Service account',
                      '',
                      '',
                      'male',
                      'Danish',
                      '2000-04-02',
                      '',
                      '',
                      '',
                      '',
                      'service@useroffice.ess.eu',
                      true,
                      '',
                      ''
                      );

    INSERT INTO role_user (role_id, user_id) VALUES (2, 0);


    INSERT INTO users (
                      user_title, 
                      firstname, 
                      middlename, 
                      lastname, 
                      username, 
                      password,
                      preferredname,
                      orcid,
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
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
                      'Carl',
                      '123123123',
                      '581459604',
                      'male',
                      'Norwegian',
                      '2000-04-02',
                      'Roberts, Reilly and Gutkowski',
                      'IT deparment',
                      'Estonia, New Gabriella, 4056 Cronin Motorway',
                      'Strategist',
                      'Javon4@hotmail.com',
                      true,
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
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
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
                    'Alexander',
                    '878321897',
                    '123123123',
                    'male',
                    'French',
                    '1981-08-05',
                    'Pfannerstill and Sons',
                    'IT department',
                    'Congo, Alleneville, 35823 Mueller Glens',
                    'Liaison',
                    'Aaron_Harris49@gmail.com',
                    true,
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
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
                      telephone,
                      telephone_alt
                      ) 
    VALUES (
                    'Mr.', 
                    'Nils', 
                    'Noah',
                    'Nilsson', 
                    'testreviewer', 
                    '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                    'Nicolas',
                    '878321897',
                    '123123123',
                    'male',
                    'French',
                    '1981-08-05',
                    'Pfannerstill and Sons',
                    'IT department',
                    'Congo, Alleneville, 35823 Mueller Glens',
                    'Liaison',
                    'nils@ess.se',
                    true,
                    '711-316-5728',
                    '1-359-864-3489 x7390'
                    );

    INSERT INTO role_user (role_id, user_id) VALUES (3, 3);

    INSERT INTO users (
                      user_title, 
                      firstname, 
                      middlename, 
                      lastname, 
                      username, 
                      password,
                      preferredname,
                      orcid,
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
                      telephone,
                      telephone_alt
                      ) 
    VALUES 
                    (
                      'Mr.', 
                      'Benjamin',
                      'Bryson', 
                      'Beckley', 
                      'testuser2', 
                      '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                      'Benjamin',
                      '123123123',
                      '581459604',
                      'male',
                      'Danish',
                      '2000-04-02',
                      'Roberts, Reilly and Gutkowski',
                      'IT deparment',
                      'Denmark, Carlton Road, 2100 Riverside Avenue',
                      'Management',
                      'ben@inbox.com',
                      true,
                      '(288) 221-4533',
                      '(370) 555-4432'
                      );

    INSERT INTO role_user (role_id, user_id) VALUES (1, 4);

    -- this user is used for testing manual email verification and to remove the placeholder flag
    INSERT INTO users (
                      user_title, 
                      firstname, 
                      middlename, 
                      lastname, 
                      username, 
                      password,
                      preferredname,
                      orcid,
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
                      telephone,
                      telephone_alt
                      ) 
    VALUES 
                    (
                      'Mr.', 
                      'Unverified email',
                      '', 
                      'Placeholder', 
                      'testuser3', 
                      '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                      '',
                      '123123123',
                      '581459604',
                      'male',
                      'Danish',
                      '2000-04-02',
                      'Roberts, Reilly and Gutkowski',
                      'IT deparment',
                      'Denmark, Carlton Road, 2100 Riverside Avenue',
                      'Management',
                      'unverified-user@example.com',
                      false,
                      '(288) 221-4533',
                      '(370) 555-4432'
                      );

    INSERT INTO role_user (role_id, user_id) VALUES (1, 5);


    /* User with a user role */
    INSERT INTO users (
                      user_title, 
                      firstname, 
                      middlename, 
                      lastname, 
                      username, 
                      password,
                      preferredname,
                      orcid,
                      orcid_refreshToken,
                      gender,
                      nationality,
                      birthdate,
                      organisation,
                      department,
                      organisation_address,
                      position,
                      email,
                      email_verified,
                      telephone,
                      telephone_alt
                      ) 
    VALUES 
                    (
                      'Mr.', 
                      'David',
                      'David', 
                      'Dawson', 
                      'testuser4', 
                      '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                      'David',
                      '123123123',
                      '581459604',
                      'male',
                      'Austrian',
                      '1995-04-01',
                      'Silverwoods',
                      'Maxillofacial surgeon',
                      'Bahngasse 20, 9441 GRABERN',
                      'Management',
                      'david@teleworm.us',
                      true,
                      '0676 472 14 66',
                      '0676 159 94 87'
                      );

    INSERT INTO role_user (role_id, user_id) VALUES (1, 6);
    
    INSERT INTO call(
              call_short_code 
            , start_call 
            , end_call 
            , start_review 
            , end_review 
            , start_notify
            , end_notify
            , cycle_comment 
            , survey_comment )
    VALUES(
            'call 1', 
            '2019-01-01', 
            '2023-01-01',
            '2019-01-01', 
            '2023-01-01',
            '2019-01-01', 
            '2023-01-01', 
            'This is cycle comment', 
            'This is survey comment');

    INSERT INTO proposal_question_datatypes VALUES ('TEXT_INPUT');
    INSERT INTO proposal_question_datatypes VALUES ('SELECTION_FROM_OPTIONS');
    INSERT INTO proposal_question_datatypes VALUES ('BOOLEAN');
    INSERT INTO proposal_question_datatypes VALUES ('DATE');
    INSERT INTO proposal_question_datatypes VALUES ('FILE_UPLOAD');
    INSERT INTO proposal_question_datatypes VALUES ('EMBELLISHMENT');



    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
