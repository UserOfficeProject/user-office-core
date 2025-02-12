DO
$DO$
BEGIN
	IF register_patch('init.sql', 'unknown', 'init', '2019-10-01 00:00:00.000000+00') THEN
	BEGIN
        -- Dumped from database version 16.6
        -- Dumped by pg_dump version 16.6 (Ubuntu 16.6-0ubuntu0.24.04.1)

        SET statement_timeout = 0;
        SET lock_timeout = 0;
        SET idle_in_transaction_session_timeout = 0;
        SET client_encoding = 'UTF8';
        SET standard_conforming_strings = on;
        SET check_function_bodies = false;
        SET xmloption = content;
        SET client_min_messages = warning;
        SET row_security = off;



        -- *not* creating schema, since initdb creates it


        ALTER SCHEMA public OWNER TO duouser;



        COMMENT ON SCHEMA public IS '';




        CREATE FUNCTION public.file_id_pseudo_encrypt(value bigint) RETURNS bigint
            LANGUAGE plpgsql IMMUTABLE STRICT
            AS $$
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
            $$;


        ALTER FUNCTION public.file_id_pseudo_encrypt(value bigint) OWNER TO duouser;

        -- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: duouser
        --

        CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
            END;
            $$;


        ALTER FUNCTION public.trigger_set_timestamp() OWNER TO duouser;

        SET default_tablespace = '';

        SET default_table_access_method = heap;



        CREATE TABLE public.call (
            call_id integer NOT NULL,
            call_short_code character varying(20) NOT NULL,
            start_call date NOT NULL,
            end_call date NOT NULL,
            start_review date NOT NULL,
            end_review date NOT NULL,
            start_notify date NOT NULL,
            end_notify date NOT NULL,
            cycle_comment character varying(100) NOT NULL,
            survey_comment character varying(100) NOT NULL
        );


        ALTER TABLE public.call OWNER TO duouser;



        CREATE SEQUENCE public.call_call_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.call_call_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.call_call_id_seq OWNED BY public.call.call_id;





        CREATE SEQUENCE public.files_file_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.files_file_id_seq OWNER TO duouser;



        CREATE TABLE public.files (
            file_id bigint DEFAULT public.file_id_pseudo_encrypt(nextval('public.files_file_id_seq'::regclass)) NOT NULL,
            file_name character varying(512) NOT NULL,
            size_in_bytes integer,
            mime_type character varying(64),
            oid integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.files OWNER TO duouser;



        CREATE TABLE public.pagetext (
            pagetext_id integer NOT NULL,
            content text
        );


        ALTER TABLE public.pagetext OWNER TO duouser;



        CREATE SEQUENCE public.pagetext_pagetext_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.pagetext_pagetext_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.pagetext_pagetext_id_seq OWNED BY public.pagetext.pagetext_id;




        CREATE TABLE public.proposal_answers (
            answer_id integer NOT NULL,
            proposal_id integer NOT NULL,
            proposal_question_id character varying(64) NOT NULL,
            answer character varying(512),
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.proposal_answers OWNER TO duouser;



        CREATE SEQUENCE public.proposal_answers_answer_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_answers_answer_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.proposal_answers_answer_id_seq OWNED BY public.proposal_answers.answer_id;




        CREATE TABLE public.proposal_answers_files (
            answer_id integer,
            file_id bigint
        );


        ALTER TABLE public.proposal_answers_files OWNER TO duouser;



        CREATE TABLE public.proposal_question_datatypes (
            proposal_question_datatype_id character varying(64) NOT NULL
        );


        ALTER TABLE public.proposal_question_datatypes OWNER TO duouser;



        CREATE TABLE public.proposal_question_dependencies (
            proposal_question_id character varying(64) NOT NULL,
            proposal_question_dependency character varying(64) NOT NULL,
            condition character varying(64) DEFAULT NULL::character varying
        );


        ALTER TABLE public.proposal_question_dependencies OWNER TO duouser;



        CREATE TABLE public.proposal_questions (
            proposal_question_id character varying(64) NOT NULL,
            data_type character varying(64) NOT NULL,
            question character varying(256) NOT NULL,
            topic_id integer,
            config character varying(512) DEFAULT NULL::character varying,
            sort_order integer DEFAULT 0,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.proposal_questions OWNER TO duouser;



        CREATE TABLE public.proposal_topics (
            topic_id integer NOT NULL,
            topic_title character varying(32) NOT NULL,
            is_enabled boolean DEFAULT false,
            sort_order integer NOT NULL
        );


        ALTER TABLE public.proposal_topics OWNER TO duouser;



        CREATE SEQUENCE public.proposal_topics_sort_order_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_topics_sort_order_seq OWNER TO duouser;



        ALTER SEQUENCE public.proposal_topics_sort_order_seq OWNED BY public.proposal_topics.sort_order;




        CREATE SEQUENCE public.proposal_topics_topic_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_topics_topic_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.proposal_topics_topic_id_seq OWNED BY public.proposal_topics.topic_id;




        CREATE TABLE public.proposal_user (
            proposal_id integer NOT NULL,
            user_id integer NOT NULL
        );


        ALTER TABLE public.proposal_user OWNER TO duouser;



        CREATE TABLE public.proposals (
            proposal_id integer NOT NULL,
            title character varying(100),
            abstract text,
            status integer DEFAULT 0 NOT NULL,
            proposer_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.proposals OWNER TO duouser;



        CREATE SEQUENCE public.proposals_proposal_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposals_proposal_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.proposals_proposal_id_seq OWNED BY public.proposals.proposal_id;




        CREATE TABLE public.reviews (
            review_id integer NOT NULL,
            user_id integer NOT NULL,
            proposal_id integer NOT NULL,
            comment character varying(500),
            grade integer,
            status integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.reviews OWNER TO duouser;



        CREATE SEQUENCE public.reviews_review_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.reviews_review_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;




        CREATE TABLE public.role_user (
            role_id integer NOT NULL,
            user_id integer NOT NULL
        );


        ALTER TABLE public.role_user OWNER TO duouser;



        CREATE TABLE public.roles (
            role_id integer NOT NULL,
            short_code character varying(20) NOT NULL,
            title character varying(20) NOT NULL
        );


        ALTER TABLE public.roles OWNER TO duouser;



        CREATE SEQUENCE public.roles_role_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.roles_role_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;




        CREATE TABLE public.users (
            user_id integer NOT NULL,
            user_title character varying(5) DEFAULT NULL::character varying,
            middlename character varying(20) DEFAULT NULL::character varying,
            firstname character varying(20) NOT NULL,
            lastname character varying(20) NOT NULL,
            username character varying(20),
            password character varying(100) NOT NULL,
            preferredname character varying(20) DEFAULT NULL::character varying,
            orcid character varying(100) NOT NULL,
            orcid_refreshtoken character varying(100) NOT NULL,
            gender character varying(12) NOT NULL,
            nationality character varying(30) NOT NULL,
            birthdate date NOT NULL,
            organisation character varying(50) NOT NULL,
            department character varying(60) NOT NULL,
            organisation_address character varying(100) NOT NULL,
            "position" character varying(30) NOT NULL,
            email character varying(30),
            email_verified boolean DEFAULT false,
            telephone character varying(20) NOT NULL,
            telephone_alt character varying(20) DEFAULT NULL::character varying,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.users OWNER TO duouser;



        CREATE SEQUENCE public.users_user_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.users_user_id_seq OWNER TO duouser;



        ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;




        ALTER TABLE ONLY public.call ALTER COLUMN call_id SET DEFAULT nextval('public.call_call_id_seq'::regclass);




        ALTER TABLE ONLY public.pagetext ALTER COLUMN pagetext_id SET DEFAULT nextval('public.pagetext_pagetext_id_seq'::regclass);




        ALTER TABLE ONLY public.proposal_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.proposal_answers_answer_id_seq'::regclass);




        ALTER TABLE ONLY public.proposal_topics ALTER COLUMN topic_id SET DEFAULT nextval('public.proposal_topics_topic_id_seq'::regclass);




        ALTER TABLE ONLY public.proposal_topics ALTER COLUMN sort_order SET DEFAULT nextval('public.proposal_topics_sort_order_seq'::regclass);




        ALTER TABLE ONLY public.proposals ALTER COLUMN proposal_id SET DEFAULT nextval('public.proposals_proposal_id_seq'::regclass);




        ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);




        ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);




        ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);




        INSERT INTO public.call VALUES (1, 'call 1', '2019-01-01', '2030-01-01', '2019-01-01', '2030-01-01', '2019-01-01', '2030-01-01', 'This is cycle comment', 'This is survey comment');








        INSERT INTO public.pagetext VALUES (1, 'HOMEPAGE');
        INSERT INTO public.pagetext VALUES (2, 'HELPPAGE');












        INSERT INTO public.proposal_question_datatypes VALUES ('TEXT_INPUT');
        INSERT INTO public.proposal_question_datatypes VALUES ('SELECTION_FROM_OPTIONS');
        INSERT INTO public.proposal_question_datatypes VALUES ('BOOLEAN');
        INSERT INTO public.proposal_question_datatypes VALUES ('DATE');
        INSERT INTO public.proposal_question_datatypes VALUES ('FILE_UPLOAD');
        INSERT INTO public.proposal_question_datatypes VALUES ('EMBELLISHMENT');




























        INSERT INTO public.role_user VALUES (2, 0);
        INSERT INTO public.role_user VALUES (1, 1);
        INSERT INTO public.role_user VALUES (2, 2);
        INSERT INTO public.role_user VALUES (3, 3);
        INSERT INTO public.role_user VALUES (1, 4);
        INSERT INTO public.role_user VALUES (1, 5);
        INSERT INTO public.role_user VALUES (1, 6);




        INSERT INTO public.roles VALUES (1, 'user', 'User');
        INSERT INTO public.roles VALUES (2, 'user_officer', 'User Officer');
        INSERT INTO public.roles VALUES (3, 'reviewer', 'Reviewer');




        INSERT INTO public.users VALUES (0, 'Mr.', '', 'Service account', '', 'service', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Service account', '', '', 'male', 'Danish', '2000-04-02', '', '', '', '', 'service@useroffice.ess.eu', true, '', '', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');
        INSERT INTO public.users VALUES (1, 'Mr.', 'Christian', 'Carl', 'Carlsson', 'testuser', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Carl', '123123123', '581459604', 'male', 'Norwegian', '2000-04-02', 'Roberts, Reilly and Gutkowski', 'IT deparment', 'Estonia, New Gabriella, 4056 Cronin Motorway', 'Strategist', 'Javon4@hotmail.com', true, '(288) 431-1443', '(370) 386-8976', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');
        INSERT INTO public.users VALUES (2, 'Mr.', 'Adam', 'Anders', 'Andersson', 'testofficer', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Alexander', '878321897', '123123123', 'male', 'French', '1981-08-05', 'Pfannerstill and Sons', 'IT department', 'Congo, Alleneville, 35823 Mueller Glens', 'Liaison', 'Aaron_Harris49@gmail.com', true, '711-316-5728', '1-359-864-3489 x7390', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');
        INSERT INTO public.users VALUES (3, 'Mr.', 'Noah', 'Nils', 'Nilsson', 'testreviewer', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Nicolas', '878321897', '123123123', 'male', 'French', '1981-08-05', 'Pfannerstill and Sons', 'IT department', 'Congo, Alleneville, 35823 Mueller Glens', 'Liaison', 'nils@ess.se', true, '711-316-5728', '1-359-864-3489 x7390', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');
        INSERT INTO public.users VALUES (4, 'Mr.', 'Bryson', 'Benjamin', 'Beckley', 'testuser2', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Benjamin', '123123123', '581459604', 'male', 'Danish', '2000-04-02', 'Roberts, Reilly and Gutkowski', 'IT deparment', 'Denmark, Carlton Road, 2100 Riverside Avenue', 'Management', 'ben@inbox.com', true, '(288) 221-4533', '(370) 555-4432', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');
        INSERT INTO public.users VALUES (5, 'Mr.', '', 'Unverified email', 'Placeholder', 'testuser3', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', '', '123123123', '581459604', 'male', 'Danish', '2000-04-02', 'Roberts, Reilly and Gutkowski', 'IT deparment', 'Denmark, Carlton Road, 2100 Riverside Avenue', 'Management', 'unverified-user@example.com', false, '(288) 221-4533', '(370) 555-4432', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');
        INSERT INTO public.users VALUES (6, 'Mr.', 'David', 'David', 'Dawson', 'testuser4', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'David', '123123123', '581459604', 'male', 'Austrian', '1995-04-01', 'Silverwoods', 'Maxillofacial surgeon', 'Bahngasse 20, 9441 GRABERN', 'Management', 'david@teleworm.us', true, '0676 472 14 66', '0676 159 94 87', '2025-02-12 14:33:42.18935+00', '2025-02-12 14:33:42.18935+00');




        PERFORM pg_catalog.setval('public.call_call_id_seq', 1, true);




        PERFORM pg_catalog.setval('public.files_file_id_seq', 1, false);




        PERFORM pg_catalog.setval('public.pagetext_pagetext_id_seq', 2, true);




        PERFORM pg_catalog.setval('public.proposal_answers_answer_id_seq', 1, false);




        PERFORM pg_catalog.setval('public.proposal_topics_sort_order_seq', 1, false);




        PERFORM pg_catalog.setval('public.proposal_topics_topic_id_seq', 1, false);




        PERFORM pg_catalog.setval('public.proposals_proposal_id_seq', 1, false);




        PERFORM pg_catalog.setval('public.reviews_review_id_seq', 1, false);




        PERFORM pg_catalog.setval('public.roles_role_id_seq', 3, true);




        PERFORM pg_catalog.setval('public.users_user_id_seq', 6, true);




        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_pkey PRIMARY KEY (call_id);







        ALTER TABLE ONLY public.files
            ADD CONSTRAINT files_oid_key UNIQUE (oid);




        ALTER TABLE ONLY public.files
            ADD CONSTRAINT files_pkey PRIMARY KEY (file_id);




        ALTER TABLE ONLY public.pagetext
            ADD CONSTRAINT pagetext_pkey PRIMARY KEY (pagetext_id);




        ALTER TABLE ONLY public.reviews
            ADD CONSTRAINT prop_user_pkey PRIMARY KEY (proposal_id, user_id);




        ALTER TABLE ONLY public.proposal_answers
            ADD CONSTRAINT proposal_answers_answer_id_key UNIQUE (answer_id);




        ALTER TABLE ONLY public.proposal_answers
            ADD CONSTRAINT proposal_answers_pkey PRIMARY KEY (proposal_id, proposal_question_id);




        ALTER TABLE ONLY public.proposal_question_datatypes
            ADD CONSTRAINT proposal_question_datatypes_pkey PRIMARY KEY (proposal_question_datatype_id);




        ALTER TABLE ONLY public.proposal_question_dependencies
            ADD CONSTRAINT proposal_question_dependencies_pkey PRIMARY KEY (proposal_question_id, proposal_question_dependency);




        ALTER TABLE ONLY public.proposal_questions
            ADD CONSTRAINT proposal_questions_pkey PRIMARY KEY (proposal_question_id);




        ALTER TABLE ONLY public.proposal_topics
            ADD CONSTRAINT proposal_topics_pkey PRIMARY KEY (topic_id);




        ALTER TABLE ONLY public.proposal_user
            ADD CONSTRAINT proposal_user_pkey PRIMARY KEY (proposal_id, user_id);




        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_pkey PRIMARY KEY (proposal_id);




        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_id, user_id);




        ALTER TABLE ONLY public.roles
            ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);




        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_email_key UNIQUE (email);




        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);




        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_username_key UNIQUE (username);




        CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.proposal_questions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();




        CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();




        CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();




        ALTER TABLE ONLY public.proposal_answers_files
            ADD CONSTRAINT proposal_answers_files_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.proposal_answers(answer_id);




        ALTER TABLE ONLY public.proposal_answers_files
            ADD CONSTRAINT proposal_answers_files_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(file_id);




        ALTER TABLE ONLY public.proposal_answers
            ADD CONSTRAINT proposal_answers_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(proposal_id);




        ALTER TABLE ONLY public.proposal_answers
            ADD CONSTRAINT proposal_answers_proposal_question_id_fkey FOREIGN KEY (proposal_question_id) REFERENCES public.proposal_questions(proposal_question_id);




        ALTER TABLE ONLY public.proposal_question_dependencies
            ADD CONSTRAINT proposal_question_dependencie_proposal_question_dependency_fkey FOREIGN KEY (proposal_question_dependency) REFERENCES public.proposal_questions(proposal_question_id) ON DELETE CASCADE;




        ALTER TABLE ONLY public.proposal_question_dependencies
            ADD CONSTRAINT proposal_question_dependencies_proposal_question_id_fkey FOREIGN KEY (proposal_question_id) REFERENCES public.proposal_questions(proposal_question_id) ON DELETE CASCADE;




        ALTER TABLE ONLY public.proposal_questions
            ADD CONSTRAINT proposal_questions_data_type_fkey FOREIGN KEY (data_type) REFERENCES public.proposal_question_datatypes(proposal_question_datatype_id);




        ALTER TABLE ONLY public.proposal_questions
            ADD CONSTRAINT proposal_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.proposal_topics(topic_id);




        ALTER TABLE ONLY public.proposal_user
            ADD CONSTRAINT proposal_user_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(proposal_id) ON UPDATE CASCADE;




        ALTER TABLE ONLY public.proposal_user
            ADD CONSTRAINT proposal_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;




        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES public.users(user_id);




        ALTER TABLE ONLY public.reviews
            ADD CONSTRAINT reviews_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(proposal_id) ON UPDATE CASCADE;




        ALTER TABLE ONLY public.reviews
            ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;




        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT role_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE;




        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT role_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;




        REVOKE USAGE ON SCHEMA public FROM PUBLIC;
        GRANT ALL ON SCHEMA public TO PUBLIC;




    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
