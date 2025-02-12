DO
$DO$
BEGIN
	IF register_patch('init.sql', 'unknown', 'init', '2019-10-01 00:00:00.000000+00') THEN
    	BEGIN


        -- *not* creating schema, since initdb creates it


        ALTER SCHEMA public OWNER TO duouser;


        COMMENT ON SCHEMA public IS '';



        CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;



        COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';



        CREATE FUNCTION public.after_esi_delete() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
                    BEGIN
                        DELETE FROM 
                            questionaries
                        WHERE
                            questionary_id = old.questionary_id;
                    RETURN old;
                    END;
                    $$;


        ALTER FUNCTION public.after_esi_delete() OWNER TO duouser;


        CREATE FUNCTION public.after_generic_template_delete() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
                BEGIN
                    DELETE FROM 
                        questionaries
                    WHERE
                        questionary_id = old.questionary_id;
                RETURN old;
                END;
                $$;


        ALTER FUNCTION public.after_generic_template_delete() OWNER TO duouser;


        CREATE FUNCTION public.after_proposal_delete() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
                BEGIN
                    DELETE FROM 
                        questionaries
                    WHERE
                        questionary_id = old.questionary_id;
                RETURN old;
                END;
                $$;


        ALTER FUNCTION public.after_proposal_delete() OWNER TO duouser;


        CREATE FUNCTION public.after_risk_assesment_delete() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
                BEGIN
                    DELETE FROM 
                        questionaries
                    WHERE
                        questionary_id = old.questionary_id;
                RETURN old;
                END;
                $$;


        ALTER FUNCTION public.after_risk_assesment_delete() OWNER TO duouser;


        CREATE FUNCTION public.after_sample_delete() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
                BEGIN
                    DELETE FROM 
                        questionaries
                    WHERE
                        questionary_id = old.questionary_id;
                RETURN old;
                END;
                $$;


        ALTER FUNCTION public.after_sample_delete() OWNER TO duouser;


        CREATE FUNCTION public.after_shipment_delete() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
                BEGIN
                    DELETE FROM 
                        questionaries
                    WHERE
                        questionary_id = old.questionary_id;
                RETURN old;
                END;
                $$;


        ALTER FUNCTION public.after_shipment_delete() OWNER TO duouser;


        CREATE FUNCTION public.createquestionary() RETURNS integer
            LANGUAGE plpgsql
            AS $$
            declare
                q_id integer;
            BEGIN
            insert into questionaries(template_id) values(1) returning questionary_id into q_id;
            RETURN q_id;
            END;
            $$;


        ALTER FUNCTION public.createquestionary() OWNER TO duouser;


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


        CREATE FUNCTION public.generate_proposal_shortcode(id bigint) RETURNS text
            LANGUAGE plpgsql
            AS $$
            DECLARE
                max_shortcode INT := 999999;
                coprime INT := 567122; -- this will give good random feel
                new_shortcode TEXT;
            BEGIN
                new_shortcode := CAST(coprime * id % max_shortcode as TEXT); 
                new_shortcode := LPAD(new_shortcode, 6, '0');
                WHILE new_shortcode IN (SELECT proposal_id FROM proposals) LOOP
                -- generate new id
                new_shortcode := CAST(coprime * nextval('proposals_short_code_seq') % max_shortcode as TEXT); 
                new_shortcode := LPAD(new_shortcode, 6, '0');
                END LOOP;
                RETURN new_shortcode;
            END;
            $$;


        ALTER FUNCTION public.generate_proposal_shortcode(id bigint) OWNER TO duouser;



        CREATE FUNCTION public.replace_old_user_id_with_new(INOUT p_old_user_id bigint, INOUT p_new_user_id bigint) RETURNS record
            LANGUAGE plpgsql
            AS $$
            DECLARE
                NEW_USER_CNT      INTEGER := 0;
                OLD_USER_CNT      INTEGER := 0;
                MTR_PK_UN_COL_CNT INTEGER := 0;
                MTR_REC           record;
                MTR_PK_UN_REC     record;
                UPD_SQL           TEXT;
                DEL_SQL           TEXT;
                EXIST_SEL         TEXT;
                EXIST_WH          TEXT;
                IS_NEW_USERID	  INTEGER;
            BEGIN
                IF P_OLD_USER_ID = P_NEW_USER_ID THEN 
                    RETURN;
                END IF; 
                SELECT COUNT(*) FROM USERS WHERE USER_ID = P_OLD_USER_ID INTO OLD_USER_CNT;
                IF OLD_USER_CNT = 0 THEN 
                    RETURN;
                END IF; 
                TRUNCATE TABLE MERGING_TABLE_REGISTRY;
                INSERT INTO MERGING_TABLE_REGISTRY (TABLE_NAME, COLUMN_NAME) 
                SELECT KCU.TABLE_NAME, KCU.column_name FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC 
                JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU
                    ON TC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
                    AND TC.TABLE_SCHEMA = KCU.TABLE_SCHEMA
                JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS CCU
                    ON CCU.CONSTRAINT_NAME = TC.CONSTRAINT_NAME
                WHERE TC.CONSTRAINT_TYPE = 'FOREIGN KEY'
                    AND UPPER(TC.TABLE_SCHEMA) ='PUBLIC'
                    AND UPPER(CCU.TABLE_SCHEMA) ='PUBLIC'
                    AND UPPER(CCU.COLUMN_NAME) ='USER_ID'
                    AND UPPER(CCU.TABLE_NAME) ='USERS';
                SELECT COUNT(*) FROM USERS WHERE USER_ID = P_NEW_USER_ID INTO NEW_USER_CNT;
                IF NEW_USER_CNT = 0 THEN
                    INSERT INTO USERS (USER_ID, FIRSTNAME, LASTNAME, USERNAME, GENDER, BIRTHDATE, DEPARTMENT, POSITION, EMAIL, TELEPHONE) 
                    VALUES (P_NEW_USER_ID, '', '', P_NEW_USER_ID, '', NOW(), '', '', P_NEW_USER_ID, '');
                END IF;
                FOR MTR_REC IN SELECT TABLE_NAME, COLUMN_NAME 
                FROM MERGING_TABLE_REGISTRY ORDER BY TABLE_NAME, COLUMN_NAME 
                LOOP
                MTR_PK_UN_COL_CNT := 0;
                UPD_SQL := '';
                DEL_SQL := '';
                EXIST_SEL := '';
                EXIST_WH := '';
                UPD_SQL = 'UPDATE ' || MTR_REC.TABLE_NAME || ' AS T1 SET ' || MTR_REC.COLUMN_NAME ||
                        ' = ' || P_NEW_USER_ID || ' WHERE T1.' || MTR_REC.COLUMN_NAME || ' = ' || P_OLD_USER_ID ||' ';
                FOR MTR_PK_UN_REC IN SELECT KCU.TABLE_NAME, CCU.COLUMN_NAME
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC 
                    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU
                        ON TC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
                        AND TC.TABLE_SCHEMA = KCU.TABLE_SCHEMA
                    JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS CCU
                        ON CCU.CONSTRAINT_NAME = TC.CONSTRAINT_NAME
                    WHERE ( 
                        TC.CONSTRAINT_TYPE = 'PRIMARY KEY'
                        OR TC.CONSTRAINT_TYPE = 'UNIQUE'
                        ) 
                        AND UPPER(TC.TABLE_SCHEMA) ='PUBLIC'
                        AND UPPER(CCU.TABLE_SCHEMA) ='PUBLIC'
                        AND KCU.TABLE_NAME = MTR_REC.TABLE_NAME
                        AND KCU.COLUMN_NAME = MTR_REC.COLUMN_NAME
                LOOP 
                    MTR_PK_UN_COL_CNT := MTR_PK_UN_COL_CNT + 1;
                    IF MTR_PK_UN_COL_CNT = 2 THEN 
                    DEL_SQL = 'DELETE FROM ' || MTR_REC.TABLE_NAME || 
                    ' T1 WHERE '|| MTR_REC.COLUMN_NAME ||
                    ' = ' ||P_OLD_USER_ID;
                    END IF;
                    IF LENGTH(EXIST_WH) > 0 THEN
                    EXIST_WH = EXIST_WH || ' AND T2.';
                    END IF;
                    IS_NEW_USERID := 0;
                    SELECT COUNT(*) FROM MERGING_TABLE_REGISTRY 
                    WHERE TABLE_NAME = MTR_PK_UN_REC.TABLE_NAME 
                    AND COLUMN_NAME = MTR_PK_UN_REC.COLUMN_NAME 
                    INTO IS_NEW_USERID;
                    IF IS_NEW_USERID = 1 THEN
                    EXIST_WH = EXIST_WH || MTR_PK_UN_REC.COLUMN_NAME || ' = ' || P_NEW_USER_ID ;
                    ELSE 
                    IF LENGTH(EXIST_SEL) > 0 THEN 
                        EXIST_SEL = EXIST_SEL || ', ';
                    END IF;
                    EXIST_SEL = EXIST_SEL || 'T2.' || MTR_PK_UN_REC.COLUMN_NAME;
                    EXIST_WH = EXIST_WH || MTR_PK_UN_REC.COLUMN_NAME || ' = T1.' || MTR_PK_UN_REC.COLUMN_NAME;
                    END IF;               
                END LOOP;
                IF MTR_PK_UN_COL_CNT > 1 THEN
                    UPD_SQL := UPD_SQL || ' AND NOT EXISTS ( SELECT ' || EXIST_SEL || ' FROM ' || MTR_REC.TABLE_NAME || ' T2 WHERE T2.' || EXIST_WH || '); ';
                    DEL_SQL := DEL_SQL || ' AND EXISTS ( SELECT '  || EXIST_SEL || ' FROM ' || MTR_REC.TABLE_NAME || ' T2 WHERE T2.' || EXIST_WH || '); ';
                END IF;
                RAISE NOTICE '%',UPD_SQL;
                EXECUTE UPD_SQL;
                IF LENGTH(DEL_SQL) > 0 THEN 
                    RAISE NOTICE '%',DEL_SQL;
                    EXECUTE DEL_SQL;
                END IF;
                END LOOP;
                DELETE FROM USERS WHERE USER_ID = P_OLD_USER_ID;
                RETURN; 
                EXCEPTION WHEN OTHERS THEN
                    RAISE EXCEPTION 'ROLLBACK REPLACE_OLD_USER_ID_WITH_NEW FUNC WITH OLD USER ID: % AND NEW USER ID: %', P_OLD_USER_ID, P_NEW_USER_ID;
            END;
            $$;


        ALTER FUNCTION public.replace_old_user_id_with_new(INOUT p_old_user_id bigint, INOUT p_new_user_id bigint) OWNER TO duouser;


        CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
            END;
            $$;


        ALTER FUNCTION public.trigger_set_timestamp() OWNER TO duouser;


        CREATE TABLE public.answers (
            answer_id integer NOT NULL,
            questionary_id integer NOT NULL,
            question_id character varying(64) NOT NULL,
            answer jsonb,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.answers OWNER TO duouser;


        CREATE FUNCTION public.update_answers() RETURNS SETOF public.answers
            LANGUAGE plpgsql
            AS $$
                DECLARE
                    r answers%rowtype;
                BEGIN
                    FOR r IN
                        select answers.* from answers
                        left join questions
                        ON answers.question_id = questions.question_id
                        where questions.data_type='SELECTION_FROM_OPTIONS'
                    LOOP
                        UPDATE answers 
                        SET answer = jsonb_set(answer, '{value}', jsonb_build_array(r.answer->'value'))
                        WHERE answer_id=r.answer_id;
                        RETURN NEXT r; -- return current row of SELECT
                    END LOOP;
                    RETURN;
                END;
                $$;


        ALTER FUNCTION public.update_answers() OWNER TO duouser;


        CREATE FUNCTION public.updateanswers() RETURNS void
            LANGUAGE plpgsql
            AS $$
            DECLARE 
            t_row answers%rowtype;
            BEGIN
                FOR t_row in SELECT * FROM answers LOOP
                    update answers A
                        set questionary_id = (SELECT questionary_id from proposals P where A.questionary_id = P.proposal_id)
                    where 
                        answer_id = t_row.answer_id;
                END LOOP;
            END;
            $$;


        ALTER FUNCTION public.updateanswers() OWNER TO duouser;


        CREATE FUNCTION public.updatecompletenesses() RETURNS void
            LANGUAGE plpgsql
            AS $$
            DECLARE 
            t_row topic_completenesses%rowtype;
            BEGIN
                FOR t_row in SELECT * FROM topic_completenesses LOOP
                    update topic_completenesses TC
                        set questionary_id = (SELECT questionary_id from proposals P where TC.questionary_id = P.proposal_id)
                    where 
                        questionary_id = t_row.questionary_id AND 
                        topic_id = t_row.topic_id ;
                END LOOP;
            END;
            $$;


        ALTER FUNCTION public.updatecompletenesses() OWNER TO duouser;


        CREATE FUNCTION public.updateproposalstable() RETURNS void
            LANGUAGE plpgsql
            AS $$
            DECLARE 
            t_row proposals%rowtype;
            BEGIN
                FOR t_row in SELECT * FROM proposals LOOP
                    update proposals
                        set questionary_id = CreateQuestionary()
                    where proposal_id = t_row.proposal_id;
                END LOOP;
            END;
            $$;


        ALTER FUNCTION public.updateproposalstable() OWNER TO duouser;


        CREATE TABLE public.active_templates (
            template_id integer NOT NULL,
            group_id character varying(30) NOT NULL
        );


        ALTER TABLE public.active_templates OWNER TO duouser;


        CREATE TABLE public.api_permissions (
            access_token_id character varying(64) NOT NULL,
            name character varying(64) NOT NULL,
            access_token character varying(512) NOT NULL,
            access_permissions jsonb
        );


        ALTER TABLE public.api_permissions OWNER TO duouser;


        CREATE TABLE public.call (
            call_id integer NOT NULL,
            call_short_code character varying(20) NOT NULL,
            start_call timestamp with time zone NOT NULL,
            end_call timestamp with time zone NOT NULL,
            start_review timestamp with time zone NOT NULL,
            end_review timestamp with time zone NOT NULL,
            start_notify timestamp with time zone NOT NULL,
            end_notify timestamp with time zone NOT NULL,
            cycle_comment character varying(100) NOT NULL,
            survey_comment character varying(100) NOT NULL,
            template_id integer,
            start_cycle timestamp with time zone DEFAULT now() NOT NULL,
            end_cycle timestamp with time zone DEFAULT now() NOT NULL,
            proposal_workflow_id integer,
            call_ended boolean DEFAULT false,
            call_review_ended boolean DEFAULT false,
            start_fap_review timestamp with time zone DEFAULT now(),
            end_fap_review timestamp with time zone DEFAULT now(),
            call_fap_review_ended boolean DEFAULT false,
            reference_number_format character varying(64),
            proposal_sequence integer,
            allocation_time_unit character varying(10) DEFAULT 'day'::character varying NOT NULL,
            title character varying(100),
            description text,
            esi_template_id integer,
            submission_message text,
            is_active boolean DEFAULT true,
            pdf_template_id integer,
            end_call_internal timestamp with time zone,
            call_ended_internal boolean DEFAULT false,
            fap_review_template_id integer,
            CONSTRAINT call_allocation_time_unit_check CHECK (((allocation_time_unit)::text = ANY ((ARRAY['day'::character varying, 'hour'::character varying, 'week'::character varying])::text[])))
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



        CREATE TABLE public.call_has_faps (
            call_id integer NOT NULL,
            fap_id integer NOT NULL
        );


        ALTER TABLE public.call_has_faps OWNER TO duouser;


        CREATE TABLE public.call_has_instruments (
            call_id integer NOT NULL,
            instrument_id integer NOT NULL,
            availability_time integer,
            fap_id integer
        );


        ALTER TABLE public.call_has_instruments OWNER TO duouser;


        CREATE TABLE public.countries (
            country_id integer NOT NULL,
            country character varying(100) DEFAULT NULL::character varying
        );


        ALTER TABLE public.countries OWNER TO duouser;


        CREATE SEQUENCE public.countries_country_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.countries_country_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.countries_country_id_seq OWNED BY public.countries.country_id;




        CREATE TABLE public.event_logs (
            id integer NOT NULL,
            changed_by integer,
            event_type text,
            row_data text,
            event_tstamp timestamp with time zone DEFAULT now() NOT NULL,
            changed_object_id text,
            description text DEFAULT ''::text NOT NULL
        );


        ALTER TABLE public.event_logs OWNER TO duouser;


        CREATE SEQUENCE public.event_logs_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.event_logs_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.event_logs_id_seq OWNED BY public.event_logs.id;



        CREATE TABLE public.experiment_safety_inputs (
            esi_id integer NOT NULL,
            scheduled_event_id integer,
            creator_id integer NOT NULL,
            questionary_id integer NOT NULL,
            is_submitted boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.experiment_safety_inputs OWNER TO duouser;


        CREATE SEQUENCE public.experiment_safety_inputs_esi_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.experiment_safety_inputs_esi_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.experiment_safety_inputs_esi_id_seq OWNED BY public.experiment_safety_inputs.esi_id;



        CREATE TABLE public.fap_assignments (
            proposal_pk integer NOT NULL,
            fap_member_user_id integer NOT NULL,
            fap_id integer NOT NULL,
            date_assigned timestamp with time zone DEFAULT now() NOT NULL,
            reassigned boolean DEFAULT false,
            date_reassigned timestamp with time zone,
            email_sent boolean DEFAULT false,
            rank integer,
            fap_proposal_id integer NOT NULL
        );


        ALTER TABLE public.fap_assignments OWNER TO duouser;


        CREATE TABLE public.fap_chairs (
            user_id integer NOT NULL,
            fap_id integer NOT NULL
        );


        ALTER TABLE public.fap_chairs OWNER TO duouser;


        CREATE TABLE public.fap_meeting_decisions (
            proposal_pk integer NOT NULL,
            comment_for_management character varying(500),
            comment_for_user character varying(500),
            rank_order integer,
            recommendation integer,
            submitted boolean DEFAULT false,
            submitted_by integer,
            instrument_id integer NOT NULL,
            fap_id integer
        );


        ALTER TABLE public.fap_meeting_decisions OWNER TO duouser;


        CREATE TABLE public.fap_proposals (
            proposal_pk integer NOT NULL,
            fap_id integer,
            date_assigned timestamp with time zone DEFAULT now() NOT NULL,
            call_id integer,
            fap_time_allocation integer,
            instrument_id integer,
            fap_meeting_instrument_submitted boolean DEFAULT false,
            fap_proposal_id integer NOT NULL,
            instrument_has_proposals_id integer
        );


        ALTER TABLE public.fap_proposals OWNER TO duouser;


        CREATE SEQUENCE public.fap_proposals_fap_proposal_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.fap_proposals_fap_proposal_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.fap_proposals_fap_proposal_id_seq OWNED BY public.fap_proposals.fap_proposal_id;



        CREATE TABLE public.fap_reviewers (
            user_id integer NOT NULL,
            fap_id integer NOT NULL
        );


        ALTER TABLE public.fap_reviewers OWNER TO duouser;


        CREATE TABLE public.fap_reviews (
            review_id integer NOT NULL,
            user_id integer NOT NULL,
            proposal_pk integer NOT NULL,
            comment text,
            grade double precision,
            status integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL,
            fap_id integer NOT NULL,
            notification_email_sent boolean DEFAULT false,
            fap_proposal_id integer NOT NULL,
            questionary_id integer
        );


        ALTER TABLE public.fap_reviews OWNER TO duouser;


        CREATE TABLE public.fap_secretaries (
            user_id integer NOT NULL,
            fap_id integer NOT NULL
        );


        ALTER TABLE public.fap_secretaries OWNER TO duouser;


        CREATE TABLE public.faps (
            fap_id integer NOT NULL,
            description character varying,
            code character varying,
            number_ratings_required integer DEFAULT 2,
            active boolean,
            grade_guide text,
            custom_grade_guide boolean,
            files jsonb
        );


        ALTER TABLE public.faps OWNER TO duouser;


        CREATE SEQUENCE public.faps_fap_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.faps_fap_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.faps_fap_id_seq OWNED BY public.faps.fap_id;



        CREATE TABLE public.features (
            feature_id character varying(128) NOT NULL,
            is_enabled boolean DEFAULT false,
            description character varying(500) DEFAULT ''::character varying NOT NULL
        );


        ALTER TABLE public.features OWNER TO duouser;


        CREATE TABLE public.feedback_requests (
            feedback_request_id integer NOT NULL,
            scheduled_event_id integer NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.feedback_requests OWNER TO duouser;


        CREATE SEQUENCE public.feedback_requests_feedback_request_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.feedback_requests_feedback_request_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.feedback_requests_feedback_request_id_seq OWNED BY public.feedback_requests.feedback_request_id;



        CREATE TABLE public.feedbacks (
            feedback_id integer NOT NULL,
            scheduled_event_id integer NOT NULL,
            status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
            questionary_id integer NOT NULL,
            creator_id integer NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            submitted_at timestamp with time zone,
            CONSTRAINT feedbacks_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying])::text[])))
        );


        ALTER TABLE public.feedbacks OWNER TO duouser;


        CREATE SEQUENCE public.feedbacks_feedback_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.feedbacks_feedback_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.feedbacks_feedback_id_seq OWNED BY public.feedbacks.feedback_id;



        CREATE TABLE public.files (
            file_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
            file_name character varying(512) NOT NULL,
            size_in_bytes integer,
            mime_type character varying(256),
            oid integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.files OWNER TO duouser;


        CREATE SEQUENCE public.files_file_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.files_file_id_seq OWNER TO duouser;


        CREATE TABLE public.generic_templates (
            generic_template_id integer NOT NULL,
            title character varying(500) DEFAULT ''::character varying NOT NULL,
            proposal_pk integer,
            questionary_id integer,
            creator_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            question_id character varying(64)
        );


        ALTER TABLE public.generic_templates OWNER TO duouser;


        CREATE SEQUENCE public.generic_templates_generic_template_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.generic_templates_generic_template_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.generic_templates_generic_template_id_seq OWNED BY public.generic_templates.generic_template_id;



        CREATE TABLE public.institutions (
            institution_id integer NOT NULL,
            institution character varying(100) DEFAULT NULL::character varying,
            country_id integer,
            ror_id character varying(100)
        );


        ALTER TABLE public.institutions OWNER TO duouser;


        CREATE SEQUENCE public.institutions_institution_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.institutions_institution_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.institutions_institution_id_seq OWNED BY public.institutions.institution_id;



        CREATE TABLE public.instrument_has_proposals (
            instrument_id integer NOT NULL,
            proposal_pk integer NOT NULL,
            instrument_has_proposals_id integer NOT NULL,
            management_time_allocation integer
        );


        ALTER TABLE public.instrument_has_proposals OWNER TO duouser;


        CREATE SEQUENCE public.instrument_has_proposals_instrument_has_proposals_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.instrument_has_proposals_instrument_has_proposals_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.instrument_has_proposals_instrument_has_proposals_id_seq OWNED BY public.instrument_has_proposals.instrument_has_proposals_id;



        CREATE TABLE public.instrument_has_scientists (
            instrument_id integer NOT NULL,
            user_id integer NOT NULL
        );


        ALTER TABLE public.instrument_has_scientists OWNER TO duouser;


        CREATE TABLE public.instruments (
            instrument_id integer NOT NULL,
            name character varying(200) NOT NULL,
            short_code character varying(20) NOT NULL,
            description text,
            manager_user_id integer NOT NULL
        );


        ALTER TABLE public.instruments OWNER TO duouser;


        CREATE SEQUENCE public.instruments_instrument_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.instruments_instrument_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.instruments_instrument_id_seq OWNED BY public.instruments.instrument_id;



        CREATE TABLE public.internal_reviews (
            internal_review_id integer NOT NULL,
            title text,
            comment text,
            files jsonb,
            reviewer_id integer,
            technical_review_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            assigned_by integer
        );


        ALTER TABLE public.internal_reviews OWNER TO duouser;


        CREATE SEQUENCE public.internal_reviews_internal_review_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.internal_reviews_internal_review_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.internal_reviews_internal_review_id_seq OWNED BY public.internal_reviews.internal_review_id;



        CREATE TABLE public.merging_table_registry (
            table_name character varying(100) NOT NULL,
            column_name character varying(100) NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );


        ALTER TABLE public.merging_table_registry OWNER TO duouser;


        CREATE TABLE public.nationalities (
            nationality_id integer NOT NULL,
            nationality character varying(50) DEFAULT NULL::character varying
        );


        ALTER TABLE public.nationalities OWNER TO duouser;


        CREATE SEQUENCE public.nationalities_nationality_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.nationalities_nationality_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.nationalities_nationality_id_seq OWNED BY public.nationalities.nationality_id;



        CREATE TABLE public.status_changing_events (
            status_changing_event_id integer NOT NULL,
            proposal_workflow_connection_id integer,
            status_changing_event character varying(50) NOT NULL
        );


        ALTER TABLE public.status_changing_events OWNER TO duouser;


        CREATE SEQUENCE public.next_status_events_next_status_event_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.next_status_events_next_status_event_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.next_status_events_next_status_event_id_seq OWNED BY public.status_changing_events.status_changing_event_id;



        CREATE TABLE public.old_files (
            file_id bigint DEFAULT public.file_id_pseudo_encrypt(nextval('public.files_file_id_seq'::regclass)) NOT NULL,
            file_name character varying(512) NOT NULL,
            size_in_bytes integer,
            mime_type character varying(256),
            oid integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            file_uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL
        );


        ALTER TABLE public.old_files OWNER TO duouser;


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



        CREATE TABLE public.pdf_templates (
            pdf_template_id integer NOT NULL,
            template_id integer NOT NULL,
            template_data text DEFAULT ''::text NOT NULL,
            creator_id integer NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            template_header text DEFAULT ''::text NOT NULL,
            template_footer text DEFAULT ''::text NOT NULL,
            template_sample_declaration text DEFAULT ''::text NOT NULL,
            dummy_data text DEFAULT ''::text NOT NULL
        );


        ALTER TABLE public.pdf_templates OWNER TO duouser;


        CREATE SEQUENCE public.pdf_templates_pdf_template_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.pdf_templates_pdf_template_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.pdf_templates_pdf_template_id_seq OWNED BY public.pdf_templates.pdf_template_id;



        CREATE TABLE public.predefined_messages (
            predefined_message_id integer NOT NULL,
            title text,
            key character varying(20) NOT NULL,
            message text,
            date_modified timestamp with time zone DEFAULT now() NOT NULL,
            last_modified_by integer
        );


        ALTER TABLE public.predefined_messages OWNER TO duouser;


        CREATE SEQUENCE public.predefined_messages_predefined_message_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.predefined_messages_predefined_message_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.predefined_messages_predefined_message_id_seq OWNED BY public.predefined_messages.predefined_message_id;



        CREATE SEQUENCE public.proposals_short_code_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            MAXVALUE 999999
            CACHE 1;


        ALTER SEQUENCE public.proposals_short_code_seq OWNER TO duouser;


        CREATE TABLE public.proposals (
            proposal_pk integer NOT NULL,
            title character varying(350),
            abstract text,
            status_id integer DEFAULT 0 NOT NULL,
            proposer_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL,
            proposal_id character varying(16) DEFAULT public.generate_proposal_shortcode(nextval('public.proposals_short_code_seq'::regclass)) NOT NULL,
            final_status integer,
            call_id integer NOT NULL,
            questionary_id integer NOT NULL,
            comment_for_management text,
            comment_for_user text,
            notified boolean DEFAULT false,
            submitted boolean DEFAULT false,
            management_decision_submitted boolean DEFAULT false,
            reference_number_sequence integer
        );


        ALTER TABLE public.proposals OWNER TO duouser;


        CREATE TABLE public.questions (
            question_id character varying(64) NOT NULL,
            data_type character varying(64) NOT NULL,
            question character varying(256) NOT NULL,
            default_config jsonb,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL,
            natural_key character varying(128),
            category_id integer NOT NULL
        );


        ALTER TABLE public.questions OWNER TO duouser;


        CREATE VIEW public.proposal_answers AS
        SELECT prop.proposal_pk,
            prop.proposal_id,
            gt.generic_template_id,
            template_q.natural_key AS generic_template_natural_key,
            gt.title AS generic_template_title,
            a.answer_id,
            q.natural_key AS question_natural_key,
            (a.answer #> '{value}'::text[]) AS full_value,
            COALESCE((a.answer #>> '{value,0}'::text[]), (a.answer #>> '{value,value}'::text[]), (a.answer #>> '{value}'::text[])) AS first_value
        FROM ((((public.proposals prop
            JOIN public.generic_templates gt ON ((prop.proposal_pk = gt.proposal_pk)))
            JOIN public.questions template_q ON (((gt.question_id)::text = (template_q.question_id)::text)))
            JOIN public.answers a ON ((gt.questionary_id = a.questionary_id)))
            JOIN public.questions q ON (((a.question_id)::text = (q.question_id)::text)))
        UNION
        SELECT prop.proposal_pk,
            prop.proposal_id,
            NULL::integer AS generic_template_id,
            NULL::character varying AS generic_template_natural_key,
            NULL::character varying AS generic_template_title,
            a.answer_id,
            q.natural_key AS question_natural_key,
            (a.answer #> '{value}'::text[]) AS full_value,
            COALESCE((a.answer #>> '{value,0}'::text[]), (a.answer #>> '{value,value}'::text[]), (a.answer #>> '{value}'::text[])) AS first_value
        FROM ((public.proposals prop
            JOIN public.answers a ON ((prop.questionary_id = a.questionary_id)))
            JOIN public.questions q ON (((a.question_id)::text = (q.question_id)::text)));


        ALTER VIEW public.proposal_answers OWNER TO duouser;


        CREATE SEQUENCE public.proposal_answers_answer_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_answers_answer_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_answers_answer_id_seq OWNED BY public.answers.answer_id;



        CREATE TABLE public.proposal_events (
            proposal_pk integer NOT NULL,
            proposal_created boolean DEFAULT false,
            proposal_submitted boolean DEFAULT false,
            call_ended boolean DEFAULT false,
            proposal_faps_selected boolean DEFAULT false,
            proposal_instruments_selected boolean DEFAULT false,
            proposal_feasibility_review_submitted boolean DEFAULT false,
            proposal_sample_review_submitted boolean DEFAULT false,
            proposal_all_fap_reviewers_selected boolean DEFAULT false,
            proposal_fap_review_submitted boolean DEFAULT false,
            proposal_fap_meeting_submitted boolean DEFAULT false,
            proposal_fap_meeting_instrument_submitted boolean DEFAULT false,
            proposal_accepted boolean DEFAULT false,
            proposal_rejected boolean DEFAULT false,
            proposal_notified boolean DEFAULT false,
            call_review_ended boolean DEFAULT false,
            call_fap_review_ended boolean DEFAULT false,
            proposal_feasibility_review_feasible boolean DEFAULT false,
            proposal_sample_safe boolean DEFAULT false,
            proposal_management_decision_submitted boolean DEFAULT false,
            proposal_all_fap_reviews_submitted boolean DEFAULT false,
            proposal_fap_review_updated boolean DEFAULT false,
            proposal_feasibility_review_updated boolean DEFAULT false,
            proposal_management_decision_updated boolean DEFAULT false,
            proposal_feasibility_review_unfeasible boolean DEFAULT false,
            proposal_status_updated boolean DEFAULT false,
            proposal_fap_meeting_saved boolean DEFAULT false,
            proposal_fap_meeting_ranking_overwritten boolean DEFAULT false,
            proposal_fap_meeting_reorder boolean DEFAULT false,
            proposal_reserved boolean DEFAULT false,
            proposal_booking_time_slot_added boolean DEFAULT false,
            proposal_booking_time_slots_removed boolean DEFAULT false,
            proposal_booking_time_activated boolean DEFAULT false,
            proposal_booking_time_updated boolean DEFAULT false,
            proposal_booking_time_completed boolean DEFAULT false,
            proposal_booking_time_reopened boolean DEFAULT false,
            proposal_status_changed_by_user boolean DEFAULT false,
            proposal_status_changed_by_workflow boolean DEFAULT false,
            proposal_updated boolean DEFAULT false,
            call_ended_internal boolean DEFAULT false,
            proposal_deleted boolean DEFAULT false,
            proposal_cloned boolean DEFAULT false,
            proposal_status_action_executed boolean DEFAULT false,
            proposal_all_feasibility_reviews_submitted boolean DEFAULT false,
            proposal_all_feasibility_reviews_feasible boolean DEFAULT false,
            proposal_faps_removed boolean DEFAULT false,
            proposal_fap_meeting_instrument_unsubmitted boolean DEFAULT false,
            proposal_all_fap_meetings_submitted boolean DEFAULT false,
            proposal_all_reviews_submitted_for_all_faps boolean DEFAULT false,
            proposal_all_fap_meeting_instrument_submitted boolean DEFAULT false
        );


        ALTER TABLE public.proposal_events OWNER TO duouser;


        CREATE TABLE public.proposal_status_actions (
            proposal_status_action_id integer NOT NULL,
            name character varying(64) NOT NULL,
            description text,
            type character varying(512) NOT NULL
        );


        ALTER TABLE public.proposal_status_actions OWNER TO duouser;


        CREATE SEQUENCE public.proposal_status_actions_proposal_status_action_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_status_actions_proposal_status_action_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_status_actions_proposal_status_action_id_seq OWNED BY public.proposal_status_actions.proposal_status_action_id;



        CREATE TABLE public.proposal_statuses (
            proposal_status_id integer NOT NULL,
            name character varying(100) NOT NULL,
            description character varying(200) NOT NULL,
            is_default boolean DEFAULT false,
            short_code character varying(50) NOT NULL
        );


        ALTER TABLE public.proposal_statuses OWNER TO duouser;


        CREATE SEQUENCE public.proposal_statuses_proposal_status_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_statuses_proposal_status_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_statuses_proposal_status_id_seq OWNED BY public.proposal_statuses.proposal_status_id;



        CREATE TABLE public.technical_review (
            technical_review_id integer NOT NULL,
            proposal_pk integer,
            comment text,
            time_allocation integer,
            status integer,
            public_comment text,
            submitted boolean DEFAULT false,
            reviewer_id integer NOT NULL,
            files jsonb,
            technical_review_assignee_id integer,
            instrument_id integer,
            instrument_has_proposals_id integer
        );


        ALTER TABLE public.technical_review OWNER TO duouser;


        CREATE TABLE public.users (
            user_id integer NOT NULL,
            user_title character varying(15) DEFAULT NULL::character varying,
            middlename character varying(100) DEFAULT NULL::character varying,
            firstname character varying(100) NOT NULL,
            lastname character varying(100) NOT NULL,
            username character varying(100),
            preferredname character varying(100) DEFAULT NULL::character varying,
            oidc_sub character varying(100),
            oauth_refresh_token character varying(2048),
            gender character varying(30) NOT NULL,
            birthdate date NOT NULL,
            department character varying(100) NOT NULL,
            "position" character varying(100) NOT NULL,
            email character varying(100),
            telephone character varying(100) NOT NULL,
            telephone_alt character varying(100) DEFAULT NULL::character varying,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            updated_at timestamp with time zone DEFAULT now() NOT NULL,
            institution_id integer,
            nationality integer,
            placeholder boolean DEFAULT false,
            oauth_issuer character varying(512)
        );


        ALTER TABLE public.users OWNER TO duouser;


        CREATE VIEW public.proposal_table_view AS
        SELECT p.proposal_pk,
            p.title,
            p.proposer_id AS principal_investigator,
            p.status_id AS proposal_status_id,
            ps.name AS proposal_status_name,
            ps.description AS proposal_status_description,
            p.proposal_id,
            p.final_status,
            p.notified,
            p.questionary_id,
            p.submitted,
            t.technical_reviews,
            ihp.instruments,
            fp.faps,
            fp.fap_instruments,
            c.call_short_code,
            c.allocation_time_unit,
            c.call_id,
            c.proposal_workflow_id
        FROM (((((public.proposals p
            LEFT JOIN public.proposal_statuses ps ON ((ps.proposal_status_id = p.status_id)))
            LEFT JOIN public.call c ON ((c.call_id = p.call_id)))
            LEFT JOIN ( SELECT fp_1.proposal_pk,
                    jsonb_agg(jsonb_build_object('id', f.fap_id, 'code', f.code) ORDER BY fp_1.fap_proposal_id) AS faps,
                    jsonb_agg(jsonb_build_object('instrumentId', fp_1.instrument_id, 'fapId', f.fap_id)) AS fap_instruments
                FROM (public.fap_proposals fp_1
                    JOIN public.faps f ON ((f.fap_id = fp_1.fap_id)))
                GROUP BY fp_1.proposal_pk) fp ON ((fp.proposal_pk = p.proposal_pk)))
            LEFT JOIN ( SELECT t_1.proposal_pk,
                    jsonb_agg(jsonb_build_object('id', t_1.technical_review_id, 'timeAllocation', t_1.time_allocation, 'technicalReviewAssignee', ( SELECT jsonb_build_object('id', u.user_id, 'firstname', u.firstname, 'lastname', u.lastname) AS jsonb_build_object
                        FROM public.users u
                        WHERE (u.user_id = t_1.technical_review_assignee_id)), 'status', t_1.status, 'submitted', t_1.submitted, 'internalReviewers', ( SELECT jsonb_agg(jsonb_build_object('id', ir.reviewer_id)) AS jsonb_agg
                        FROM public.internal_reviews ir
                        WHERE (ir.technical_review_id = t_1.technical_review_id))) ORDER BY t_1.technical_review_id) AS technical_reviews
                FROM public.technical_review t_1
                GROUP BY t_1.proposal_pk) t ON ((t.proposal_pk = p.proposal_pk)))
            LEFT JOIN ( SELECT ihp_1.proposal_pk,
                    jsonb_agg(jsonb_build_object('id', ihp_1.instrument_id, 'name', i.name, 'managerUserId', i.manager_user_id, 'managementTimeAllocation', ihp_1.management_time_allocation, 'scientists', ( SELECT jsonb_agg(jsonb_build_object('id', ihs.user_id)) AS jsonb_agg
                        FROM public.instrument_has_scientists ihs
                        WHERE (ihs.instrument_id = ihp_1.instrument_id))) ORDER BY ihp_1.instrument_has_proposals_id) AS instruments
                FROM (public.instrument_has_proposals ihp_1
                    JOIN public.instruments i ON ((i.instrument_id = ihp_1.instrument_id)))
                GROUP BY ihp_1.proposal_pk) ihp ON ((ihp.proposal_pk = p.proposal_pk)))
        ORDER BY p.proposal_pk;


        ALTER VIEW public.proposal_table_view OWNER TO duouser;


        CREATE TABLE public.templates (
            template_id integer NOT NULL,
            name character varying(200) NOT NULL,
            description text,
            is_archived boolean DEFAULT false,
            group_id character varying(30) DEFAULT NULL::character varying NOT NULL
        );


        ALTER TABLE public.templates OWNER TO duouser;


        CREATE SEQUENCE public.proposal_templates_template_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_templates_template_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_templates_template_id_seq OWNED BY public.templates.template_id;



        CREATE TABLE public.topics (
            topic_id integer NOT NULL,
            topic_title character varying(32) NOT NULL,
            is_enabled boolean DEFAULT false,
            sort_order integer NOT NULL,
            template_id integer NOT NULL
        );


        ALTER TABLE public.topics OWNER TO duouser;


        CREATE SEQUENCE public.proposal_topics_sort_order_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_topics_sort_order_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_topics_sort_order_seq OWNED BY public.topics.sort_order;



        CREATE SEQUENCE public.proposal_topics_topic_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_topics_topic_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_topics_topic_id_seq OWNED BY public.topics.topic_id;



        CREATE TABLE public.proposal_user (
            proposal_pk integer NOT NULL,
            user_id integer NOT NULL
        );


        ALTER TABLE public.proposal_user OWNER TO duouser;


        CREATE TABLE public.proposal_workflow_connection_has_actions (
            connection_id integer NOT NULL,
            action_id integer NOT NULL,
            workflow_id integer,
            config jsonb
        );


        ALTER TABLE public.proposal_workflow_connection_has_actions OWNER TO duouser;


        CREATE TABLE public.proposal_workflow_connections (
            proposal_workflow_connection_id integer NOT NULL,
            proposal_workflow_id integer NOT NULL,
            proposal_status_id integer NOT NULL,
            next_proposal_status_id integer,
            prev_proposal_status_id integer,
            sort_order integer NOT NULL,
            droppable_group_id character varying(50) NOT NULL,
            parent_droppable_group_id character varying(50)
        );


        ALTER TABLE public.proposal_workflow_connections OWNER TO duouser;


        CREATE SEQUENCE public.proposal_workflow_connections_proposal_workflow_connection__seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_workflow_connections_proposal_workflow_connection__seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_workflow_connections_proposal_workflow_connection__seq OWNED BY public.proposal_workflow_connections.proposal_workflow_connection_id;



        CREATE TABLE public.proposal_workflows (
            proposal_workflow_id integer NOT NULL,
            name character varying(50) NOT NULL,
            description character varying(200) NOT NULL
        );


        ALTER TABLE public.proposal_workflows OWNER TO duouser;


        CREATE SEQUENCE public.proposal_workflows_proposal_workflow_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposal_workflows_proposal_workflow_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposal_workflows_proposal_workflow_id_seq OWNED BY public.proposal_workflows.proposal_workflow_id;



        CREATE SEQUENCE public.proposals_proposal_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.proposals_proposal_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.proposals_proposal_id_seq OWNED BY public.proposals.proposal_pk;



        CREATE TABLE public.quantities (
            quantity_id character varying(255) NOT NULL
        );


        ALTER TABLE public.quantities OWNER TO duouser;


        CREATE TABLE public.question_datatypes (
            question_datatype_id character varying(64) NOT NULL
        );


        ALTER TABLE public.question_datatypes OWNER TO duouser;


        CREATE TABLE public.question_dependencies (
            question_dependency_id integer NOT NULL,
            template_id integer NOT NULL,
            question_id character varying(64) NOT NULL,
            dependency_question_id character varying(64),
            dependency_condition jsonb
        );


        ALTER TABLE public.question_dependencies OWNER TO duouser;


        CREATE SEQUENCE public.question_dependencies_question_dependency_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.question_dependencies_question_dependency_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.question_dependencies_question_dependency_id_seq OWNED BY public.question_dependencies.question_dependency_id;



        CREATE TABLE public.questionaries (
            questionary_id integer NOT NULL,
            template_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            creator_id integer
        );


        ALTER TABLE public.questionaries OWNER TO duouser;


        CREATE SEQUENCE public.questionaries_questionary_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.questionaries_questionary_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.questionaries_questionary_id_seq OWNED BY public.questionaries.questionary_id;



        CREATE TABLE public.questions_has_template (
            template_id integer NOT NULL,
            question_id character varying(64) NOT NULL
        );


        ALTER TABLE public.questions_has_template OWNER TO duouser;


        CREATE TABLE public.redeem_codes (
            code character varying(12) NOT NULL,
            placeholder_user_id integer NOT NULL,
            created_by integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            claimed_by integer,
            claimed_at timestamp with time zone
        );


        ALTER TABLE public.redeem_codes OWNER TO duouser;


        CREATE VIEW public.review_data AS
        SELECT proposal.proposal_pk,
            proposal.proposal_id,
            proposal.title,
            proposal.instrument_name,
            proposal.availability_time,
            proposal.time_allocation,
            proposal.fap_id,
            proposal.rank_order,
            proposal.call_id,
            proposal.proposer_id,
            proposal.instrument_id,
            proposal.fap_time_allocation,
            proposal.questionary_id,
            grade.avg AS average_grade
        FROM (( SELECT fp.proposal_pk,
                    p.proposal_id,
                    p.title,
                    i.name AS instrument_name,
                    chi.availability_time,
                    tr.time_allocation,
                    f.fap_id,
                    fmd.rank_order,
                    c.call_id,
                    p.proposer_id,
                    i.instrument_id,
                    fp.fap_time_allocation,
                    p.questionary_id
                FROM (((((((public.fap_proposals fp
                    JOIN public.faps f ON ((f.fap_id = fp.fap_id)))
                    JOIN public.call c ON ((c.call_id = fp.call_id)))
                    JOIN public.proposals p ON ((p.proposal_pk = fp.proposal_pk)))
                    JOIN public.technical_review tr ON (((tr.proposal_pk = p.proposal_pk) AND (tr.instrument_id = fp.instrument_id))))
                    LEFT JOIN public.fap_meeting_decisions fmd ON ((fmd.proposal_pk = p.proposal_pk)))
                    JOIN public.call_has_instruments chi ON (((chi.instrument_id = fp.instrument_id) AND (chi.call_id = c.call_id))))
                    JOIN public.instruments i ON ((i.instrument_id = chi.instrument_id)))) proposal
            LEFT JOIN ( SELECT fr.proposal_pk,
                    avg(fr.grade) AS avg
                FROM (public.fap_proposals fp
                    JOIN public.fap_reviews fr ON ((fr.proposal_pk = fp.proposal_pk)))
                GROUP BY fr.proposal_pk) grade ON ((grade.proposal_pk = proposal.proposal_pk)));


        ALTER VIEW public.review_data OWNER TO duouser;


        CREATE SEQUENCE public.reviews_review_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.reviews_review_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.fap_reviews.review_id;



        CREATE TABLE public.role_user (
            role_id integer NOT NULL,
            user_id integer NOT NULL,
            role_user_id integer NOT NULL
        );


        ALTER TABLE public.role_user OWNER TO duouser;


        CREATE SEQUENCE public.role_user_role_user_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.role_user_role_user_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.role_user_role_user_id_seq OWNED BY public.role_user.role_user_id;



        CREATE TABLE public.roles (
            role_id integer NOT NULL,
            short_code character varying(60) NOT NULL,
            title character varying(60) NOT NULL
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



        CREATE TABLE public.sample_experiment_safety_inputs (
            esi_id integer NOT NULL,
            sample_id integer NOT NULL,
            questionary_id integer NOT NULL,
            is_submitted boolean DEFAULT false
        );


        ALTER TABLE public.sample_experiment_safety_inputs OWNER TO duouser;


        CREATE TABLE public.samples (
            sample_id integer NOT NULL,
            title character varying(100),
            creator_id integer,
            questionary_id integer,
            safety_status integer DEFAULT 0 NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            safety_comment text DEFAULT ''::text,
            proposal_pk integer NOT NULL,
            question_id character varying(64) DEFAULT NULL::character varying NOT NULL,
            shipment_id integer,
            is_post_proposal_submission boolean DEFAULT false
        );


        ALTER TABLE public.samples OWNER TO duouser;


        CREATE SEQUENCE public.samples_sample_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.samples_sample_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.samples_sample_id_seq OWNED BY public.samples.sample_id;



        CREATE TABLE public.scheduled_events (
            scheduled_event_id integer NOT NULL,
            booking_type character varying(30) NOT NULL,
            starts_at timestamp without time zone NOT NULL,
            ends_at timestamp without time zone NOT NULL,
            proposal_booking_id integer NOT NULL,
            proposal_pk integer,
            status character varying(30) NOT NULL,
            local_contact integer,
            instrument_id integer
        );


        ALTER TABLE public.scheduled_events OWNER TO duouser;


        CREATE TABLE public.settings (
            settings_id character varying(128) NOT NULL,
            settings_value character varying,
            description character varying(500) DEFAULT ''::character varying NOT NULL
        );


        ALTER TABLE public.settings OWNER TO duouser;


        CREATE TABLE public.shipments (
            shipment_id integer NOT NULL,
            title character varying(500) DEFAULT ''::character varying NOT NULL,
            proposal_pk integer,
            status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
            external_ref character varying(200) DEFAULT NULL::character varying,
            questionary_id integer,
            creator_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            scheduled_event_id integer,
            CONSTRAINT shipments_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying])::text[])))
        );


        ALTER TABLE public.shipments OWNER TO duouser;


        CREATE TABLE public.shipments_has_samples (
            shipment_id integer NOT NULL,
            sample_id integer NOT NULL
        );


        ALTER TABLE public.shipments_has_samples OWNER TO duouser;


        CREATE SEQUENCE public.shipments_shipment_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.shipments_shipment_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.shipments_shipment_id_seq OWNED BY public.shipments.shipment_id;



        CREATE SEQUENCE public.technical_review_technical_review_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.technical_review_technical_review_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.technical_review_technical_review_id_seq OWNED BY public.technical_review.technical_review_id;



        CREATE TABLE public.technique_has_instruments (
            technique_id integer NOT NULL,
            instrument_id integer NOT NULL
        );


        ALTER TABLE public.technique_has_instruments OWNER TO duouser;


        CREATE TABLE public.technique_has_scientists (
            technique_id integer NOT NULL,
            user_id integer NOT NULL
        );


        ALTER TABLE public.technique_has_scientists OWNER TO duouser;


        CREATE TABLE public.techniques (
            technique_id integer NOT NULL,
            name character varying(200) NOT NULL,
            short_code character varying(20) NOT NULL,
            description text NOT NULL
        );


        ALTER TABLE public.techniques OWNER TO duouser;


        CREATE SEQUENCE public.techniques_technique_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.techniques_technique_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.techniques_technique_id_seq OWNED BY public.techniques.technique_id;



        CREATE TABLE public.template_categories (
            template_category_id integer NOT NULL,
            name character varying(100) NOT NULL
        );


        ALTER TABLE public.template_categories OWNER TO duouser;


        CREATE SEQUENCE public.template_categories_template_category_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.template_categories_template_category_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.template_categories_template_category_id_seq OWNED BY public.template_categories.template_category_id;



        CREATE TABLE public.template_groups (
            template_group_id character varying(30) NOT NULL,
            category_id integer
        );


        ALTER TABLE public.template_groups OWNER TO duouser;


        CREATE TABLE public.templates_has_questions (
            question_id character varying(64) NOT NULL,
            template_id integer NOT NULL,
            topic_id integer NOT NULL,
            sort_order integer NOT NULL,
            config jsonb NOT NULL,
            dependencies_operator character varying(64) DEFAULT 'AND'::character varying
        );


        ALTER TABLE public.templates_has_questions OWNER TO duouser;


        CREATE TABLE public.topic_completenesses (
            questionary_id integer NOT NULL,
            topic_id integer NOT NULL,
            is_complete boolean DEFAULT false NOT NULL
        );


        ALTER TABLE public.topic_completenesses OWNER TO duouser;


        CREATE TABLE public.units (
            unit_id character varying(255) NOT NULL,
            unit character varying(255) NOT NULL,
            quantity character varying(255) NOT NULL,
            symbol character varying(255) DEFAULT ''::character varying,
            si_conversion_formula character varying(255) DEFAULT 'x'::character varying
        );


        ALTER TABLE public.units OWNER TO duouser;


        CREATE SEQUENCE public.users_user_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.users_user_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;



        CREATE TABLE public.visits (
            visit_id integer NOT NULL,
            proposal_pk integer,
            status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
            creator_id integer,
            created_at timestamp with time zone DEFAULT now() NOT NULL,
            scheduled_event_id integer NOT NULL,
            team_lead_user_id integer NOT NULL,
            CONSTRAINT visitations_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'ACCEPTED'::character varying])::text[])))
        );


        ALTER TABLE public.visits OWNER TO duouser;


        CREATE SEQUENCE public.visitations_visitation_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;


        ALTER SEQUENCE public.visitations_visitation_id_seq OWNER TO duouser;


        ALTER SEQUENCE public.visitations_visitation_id_seq OWNED BY public.visits.visit_id;



        CREATE TABLE public.visits_has_users (
            visit_id integer NOT NULL,
            user_id integer NOT NULL,
            registration_questionary_id integer,
            is_registration_submitted boolean DEFAULT false,
            training_expiry_date timestamp with time zone,
            starts_at timestamp without time zone,
            ends_at timestamp without time zone
        );


        ALTER TABLE public.visits_has_users OWNER TO duouser;


        ALTER TABLE ONLY public.answers ALTER COLUMN answer_id SET DEFAULT nextval('public.proposal_answers_answer_id_seq'::regclass);



        ALTER TABLE ONLY public.call ALTER COLUMN call_id SET DEFAULT nextval('public.call_call_id_seq'::regclass);



        ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_country_id_seq'::regclass);



        ALTER TABLE ONLY public.event_logs ALTER COLUMN id SET DEFAULT nextval('public.event_logs_id_seq'::regclass);



        ALTER TABLE ONLY public.experiment_safety_inputs ALTER COLUMN esi_id SET DEFAULT nextval('public.experiment_safety_inputs_esi_id_seq'::regclass);



        ALTER TABLE ONLY public.fap_proposals ALTER COLUMN fap_proposal_id SET DEFAULT nextval('public.fap_proposals_fap_proposal_id_seq'::regclass);



        ALTER TABLE ONLY public.fap_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);



        ALTER TABLE ONLY public.faps ALTER COLUMN fap_id SET DEFAULT nextval('public.faps_fap_id_seq'::regclass);



        ALTER TABLE ONLY public.feedback_requests ALTER COLUMN feedback_request_id SET DEFAULT nextval('public.feedback_requests_feedback_request_id_seq'::regclass);



        ALTER TABLE ONLY public.feedbacks ALTER COLUMN feedback_id SET DEFAULT nextval('public.feedbacks_feedback_id_seq'::regclass);



        ALTER TABLE ONLY public.generic_templates ALTER COLUMN generic_template_id SET DEFAULT nextval('public.generic_templates_generic_template_id_seq'::regclass);



        ALTER TABLE ONLY public.institutions ALTER COLUMN institution_id SET DEFAULT nextval('public.institutions_institution_id_seq'::regclass);



        ALTER TABLE ONLY public.instrument_has_proposals ALTER COLUMN instrument_has_proposals_id SET DEFAULT nextval('public.instrument_has_proposals_instrument_has_proposals_id_seq'::regclass);



        ALTER TABLE ONLY public.instruments ALTER COLUMN instrument_id SET DEFAULT nextval('public.instruments_instrument_id_seq'::regclass);



        ALTER TABLE ONLY public.internal_reviews ALTER COLUMN internal_review_id SET DEFAULT nextval('public.internal_reviews_internal_review_id_seq'::regclass);



        ALTER TABLE ONLY public.nationalities ALTER COLUMN nationality_id SET DEFAULT nextval('public.nationalities_nationality_id_seq'::regclass);



        ALTER TABLE ONLY public.pagetext ALTER COLUMN pagetext_id SET DEFAULT nextval('public.pagetext_pagetext_id_seq'::regclass);



        ALTER TABLE ONLY public.pdf_templates ALTER COLUMN pdf_template_id SET DEFAULT nextval('public.pdf_templates_pdf_template_id_seq'::regclass);



        ALTER TABLE ONLY public.predefined_messages ALTER COLUMN predefined_message_id SET DEFAULT nextval('public.predefined_messages_predefined_message_id_seq'::regclass);



        ALTER TABLE ONLY public.proposal_status_actions ALTER COLUMN proposal_status_action_id SET DEFAULT nextval('public.proposal_status_actions_proposal_status_action_id_seq'::regclass);



        ALTER TABLE ONLY public.proposal_statuses ALTER COLUMN proposal_status_id SET DEFAULT nextval('public.proposal_statuses_proposal_status_id_seq'::regclass);



        ALTER TABLE ONLY public.proposal_workflow_connections ALTER COLUMN proposal_workflow_connection_id SET DEFAULT nextval('public.proposal_workflow_connections_proposal_workflow_connection__seq'::regclass);



        ALTER TABLE ONLY public.proposal_workflows ALTER COLUMN proposal_workflow_id SET DEFAULT nextval('public.proposal_workflows_proposal_workflow_id_seq'::regclass);



        ALTER TABLE ONLY public.proposals ALTER COLUMN proposal_pk SET DEFAULT nextval('public.proposals_proposal_id_seq'::regclass);



        ALTER TABLE ONLY public.question_dependencies ALTER COLUMN question_dependency_id SET DEFAULT nextval('public.question_dependencies_question_dependency_id_seq'::regclass);



        ALTER TABLE ONLY public.questionaries ALTER COLUMN questionary_id SET DEFAULT nextval('public.questionaries_questionary_id_seq'::regclass);



        ALTER TABLE ONLY public.role_user ALTER COLUMN role_user_id SET DEFAULT nextval('public.role_user_role_user_id_seq'::regclass);



        ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);



        ALTER TABLE ONLY public.samples ALTER COLUMN sample_id SET DEFAULT nextval('public.samples_sample_id_seq'::regclass);



        ALTER TABLE ONLY public.shipments ALTER COLUMN shipment_id SET DEFAULT nextval('public.shipments_shipment_id_seq'::regclass);



        ALTER TABLE ONLY public.status_changing_events ALTER COLUMN status_changing_event_id SET DEFAULT nextval('public.next_status_events_next_status_event_id_seq'::regclass);



        ALTER TABLE ONLY public.technical_review ALTER COLUMN technical_review_id SET DEFAULT nextval('public.technical_review_technical_review_id_seq'::regclass);



        ALTER TABLE ONLY public.techniques ALTER COLUMN technique_id SET DEFAULT nextval('public.techniques_technique_id_seq'::regclass);



        ALTER TABLE ONLY public.template_categories ALTER COLUMN template_category_id SET DEFAULT nextval('public.template_categories_template_category_id_seq'::regclass);



        ALTER TABLE ONLY public.templates ALTER COLUMN template_id SET DEFAULT nextval('public.proposal_templates_template_id_seq'::regclass);



        ALTER TABLE ONLY public.topics ALTER COLUMN topic_id SET DEFAULT nextval('public.proposal_topics_topic_id_seq'::regclass);



        ALTER TABLE ONLY public.topics ALTER COLUMN sort_order SET DEFAULT nextval('public.proposal_topics_sort_order_seq'::regclass);



        ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);



        ALTER TABLE ONLY public.visits ALTER COLUMN visit_id SET DEFAULT nextval('public.visitations_visitation_id_seq'::regclass);












        INSERT INTO public.call VALUES (1, 'call 1', '2018-12-31 23:00:00+00', '2029-12-31 23:00:00+00', '2018-12-31 23:00:00+00', '2029-12-31 23:00:00+00', '2018-12-31 23:00:00+00', '2029-12-31 23:00:00+00', 'This is cycle comment', 'This is survey comment', 1, '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, false, false, '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', false, NULL, NULL, 'day', NULL, NULL, NULL, NULL, true, NULL, '2029-12-31 23:00:00+00', true, 2);









        INSERT INTO public.countries VALUES (1, 'Afghanistan');
        INSERT INTO public.countries VALUES (2, 'Albania');
        INSERT INTO public.countries VALUES (3, 'Algeria');
        INSERT INTO public.countries VALUES (4, 'Andorra');
        INSERT INTO public.countries VALUES (5, 'Angola');
        INSERT INTO public.countries VALUES (6, 'Anguilla');
        INSERT INTO public.countries VALUES (7, 'Antigua & Barbuda');
        INSERT INTO public.countries VALUES (8, 'Argentina');
        INSERT INTO public.countries VALUES (9, 'Armenia');
        INSERT INTO public.countries VALUES (10, 'Australia');
        INSERT INTO public.countries VALUES (11, 'Austria');
        INSERT INTO public.countries VALUES (12, 'Azerbaijan');
        INSERT INTO public.countries VALUES (13, 'Bahamas');
        INSERT INTO public.countries VALUES (14, 'Bahrain');
        INSERT INTO public.countries VALUES (15, 'Bangladesh');
        INSERT INTO public.countries VALUES (16, 'Barbados');
        INSERT INTO public.countries VALUES (17, 'Belarus');
        INSERT INTO public.countries VALUES (18, 'Belgium');
        INSERT INTO public.countries VALUES (19, 'Belize');
        INSERT INTO public.countries VALUES (20, 'Benin');
        INSERT INTO public.countries VALUES (21, 'Bermuda');
        INSERT INTO public.countries VALUES (22, 'Bhutan');
        INSERT INTO public.countries VALUES (23, 'Bolivia');
        INSERT INTO public.countries VALUES (24, 'Bosnia & Herzegovina');
        INSERT INTO public.countries VALUES (25, 'Botswana');
        INSERT INTO public.countries VALUES (26, 'Brazil');
        INSERT INTO public.countries VALUES (27, 'Brunei Darussalam');
        INSERT INTO public.countries VALUES (28, 'Bulgaria');
        INSERT INTO public.countries VALUES (29, 'Burkina Faso');
        INSERT INTO public.countries VALUES (30, 'Burundi');
        INSERT INTO public.countries VALUES (31, 'Cambodia');
        INSERT INTO public.countries VALUES (32, 'Cameroon');
        INSERT INTO public.countries VALUES (33, 'Canada');
        INSERT INTO public.countries VALUES (34, 'Cape Verde');
        INSERT INTO public.countries VALUES (35, 'Cayman Islands');
        INSERT INTO public.countries VALUES (36, 'Central African Republic');
        INSERT INTO public.countries VALUES (37, 'Chad');
        INSERT INTO public.countries VALUES (38, 'Chile');
        INSERT INTO public.countries VALUES (39, 'China');
        INSERT INTO public.countries VALUES (40, 'China - Hong Kong / Macau');
        INSERT INTO public.countries VALUES (41, 'Colombia');
        INSERT INTO public.countries VALUES (42, 'Comoros');
        INSERT INTO public.countries VALUES (43, 'Congo');
        INSERT INTO public.countries VALUES (44, 'Congo, Democratic Republic of (DRC)');
        INSERT INTO public.countries VALUES (45, 'Costa Rica');
        INSERT INTO public.countries VALUES (46, 'Croatia');
        INSERT INTO public.countries VALUES (47, 'Cuba');
        INSERT INTO public.countries VALUES (48, 'Cyprus');
        INSERT INTO public.countries VALUES (49, 'Czech Republic');
        INSERT INTO public.countries VALUES (50, 'Denmark');
        INSERT INTO public.countries VALUES (51, 'Djibouti');
        INSERT INTO public.countries VALUES (52, 'Dominica');
        INSERT INTO public.countries VALUES (53, 'Dominican Republic');
        INSERT INTO public.countries VALUES (54, 'Ecuador');
        INSERT INTO public.countries VALUES (55, 'Egypt');
        INSERT INTO public.countries VALUES (56, 'El Salvador');
        INSERT INTO public.countries VALUES (57, 'Equatorial Guinea');
        INSERT INTO public.countries VALUES (58, 'Eritrea');
        INSERT INTO public.countries VALUES (59, 'Estonia');
        INSERT INTO public.countries VALUES (60, 'Eswatini');
        INSERT INTO public.countries VALUES (61, 'Ethiopia');
        INSERT INTO public.countries VALUES (62, 'Fiji');
        INSERT INTO public.countries VALUES (63, 'Finland');
        INSERT INTO public.countries VALUES (64, 'France');
        INSERT INTO public.countries VALUES (65, 'French Guiana');
        INSERT INTO public.countries VALUES (66, 'Gabon');
        INSERT INTO public.countries VALUES (67, 'Gambia, Republic of The');
        INSERT INTO public.countries VALUES (68, 'Georgia');
        INSERT INTO public.countries VALUES (69, 'Germany');
        INSERT INTO public.countries VALUES (70, 'Ghana');
        INSERT INTO public.countries VALUES (71, 'Great Britain');
        INSERT INTO public.countries VALUES (72, 'Greece');
        INSERT INTO public.countries VALUES (73, 'Grenada');
        INSERT INTO public.countries VALUES (74, 'Guadeloupe');
        INSERT INTO public.countries VALUES (75, 'Guatemala');
        INSERT INTO public.countries VALUES (76, 'Guinea');
        INSERT INTO public.countries VALUES (77, 'Guinea-Bissau');
        INSERT INTO public.countries VALUES (78, 'Guyana');
        INSERT INTO public.countries VALUES (79, 'Haiti');
        INSERT INTO public.countries VALUES (80, 'Honduras');
        INSERT INTO public.countries VALUES (81, 'Hungary');
        INSERT INTO public.countries VALUES (82, 'Iceland');
        INSERT INTO public.countries VALUES (83, 'India');
        INSERT INTO public.countries VALUES (84, 'Indonesia');
        INSERT INTO public.countries VALUES (85, 'Iran');
        INSERT INTO public.countries VALUES (86, 'Iraq');
        INSERT INTO public.countries VALUES (87, 'Israel and the Occupied Territories');
        INSERT INTO public.countries VALUES (88, 'Italy');
        INSERT INTO public.countries VALUES (89, 'Ivory Coast');
        INSERT INTO public.countries VALUES (90, 'Jamaica');
        INSERT INTO public.countries VALUES (91, 'Japan');
        INSERT INTO public.countries VALUES (92, 'Jordan');
        INSERT INTO public.countries VALUES (93, 'Kazakhstan');
        INSERT INTO public.countries VALUES (94, 'Kenya');
        INSERT INTO public.countries VALUES (95, 'Korea, Democratic Republic of (North Korea)');
        INSERT INTO public.countries VALUES (96, 'Korea, Republic of (South Korea)');
        INSERT INTO public.countries VALUES (97, 'Kosovo');
        INSERT INTO public.countries VALUES (98, 'Kuwait');
        INSERT INTO public.countries VALUES (99, 'Kyrgyz Republic (Kyrgyzstan)');
        INSERT INTO public.countries VALUES (100, 'Laos');
        INSERT INTO public.countries VALUES (101, 'Latvia');
        INSERT INTO public.countries VALUES (102, 'Lebanon');
        INSERT INTO public.countries VALUES (103, 'Lesotho');
        INSERT INTO public.countries VALUES (104, 'Liberia');
        INSERT INTO public.countries VALUES (105, 'Libya');
        INSERT INTO public.countries VALUES (106, 'Liechtenstein');
        INSERT INTO public.countries VALUES (107, 'Lithuania');
        INSERT INTO public.countries VALUES (108, 'Luxembourg');
        INSERT INTO public.countries VALUES (109, 'Madagascar');
        INSERT INTO public.countries VALUES (110, 'Malawi');
        INSERT INTO public.countries VALUES (111, 'Malaysia');
        INSERT INTO public.countries VALUES (112, 'Maldives');
        INSERT INTO public.countries VALUES (113, 'Mali');
        INSERT INTO public.countries VALUES (114, 'Malta');
        INSERT INTO public.countries VALUES (115, 'Martinique');
        INSERT INTO public.countries VALUES (116, 'Mauritania');
        INSERT INTO public.countries VALUES (117, 'Mauritius');
        INSERT INTO public.countries VALUES (118, 'Mayotte');
        INSERT INTO public.countries VALUES (119, 'Mexico');
        INSERT INTO public.countries VALUES (120, 'Moldova, Republic of');
        INSERT INTO public.countries VALUES (121, 'Monaco');
        INSERT INTO public.countries VALUES (122, 'Mongolia');
        INSERT INTO public.countries VALUES (123, 'Montenegro');
        INSERT INTO public.countries VALUES (124, 'Montserrat');
        INSERT INTO public.countries VALUES (125, 'Morocco');
        INSERT INTO public.countries VALUES (126, 'Mozambique');
        INSERT INTO public.countries VALUES (127, 'Myanmar/Burma');
        INSERT INTO public.countries VALUES (128, 'Namibia');
        INSERT INTO public.countries VALUES (129, 'Nepal');
        INSERT INTO public.countries VALUES (130, 'New Zealand');
        INSERT INTO public.countries VALUES (131, 'Nicaragua');
        INSERT INTO public.countries VALUES (132, 'Niger');
        INSERT INTO public.countries VALUES (133, 'Nigeria');
        INSERT INTO public.countries VALUES (134, 'North Macedonia, Republic of');
        INSERT INTO public.countries VALUES (135, 'Norway');
        INSERT INTO public.countries VALUES (136, 'Oman');
        INSERT INTO public.countries VALUES (137, 'Pacific Islands');
        INSERT INTO public.countries VALUES (138, 'Pakistan');
        INSERT INTO public.countries VALUES (139, 'Panama');
        INSERT INTO public.countries VALUES (140, 'Papua New Guinea');
        INSERT INTO public.countries VALUES (141, 'Paraguay');
        INSERT INTO public.countries VALUES (142, 'Peru');
        INSERT INTO public.countries VALUES (143, 'Philippines');
        INSERT INTO public.countries VALUES (144, 'Poland');
        INSERT INTO public.countries VALUES (145, 'Portugal');
        INSERT INTO public.countries VALUES (146, 'Puerto Rico');
        INSERT INTO public.countries VALUES (147, 'Qatar');
        INSERT INTO public.countries VALUES (148, 'Reunion');
        INSERT INTO public.countries VALUES (149, 'Romania');
        INSERT INTO public.countries VALUES (150, 'Russian Federation');
        INSERT INTO public.countries VALUES (151, 'Rwanda');
        INSERT INTO public.countries VALUES (152, 'Saint Kitts and Nevis');
        INSERT INTO public.countries VALUES (153, 'Saint Lucia');
        INSERT INTO public.countries VALUES (154, 'Saint Vincent and the Grenadines');
        INSERT INTO public.countries VALUES (155, 'Samoa');
        INSERT INTO public.countries VALUES (156, 'Sao Tome and Principe');
        INSERT INTO public.countries VALUES (157, 'Saudi Arabia');
        INSERT INTO public.countries VALUES (158, 'Senegal');
        INSERT INTO public.countries VALUES (159, 'Serbia');
        INSERT INTO public.countries VALUES (160, 'Seychelles');
        INSERT INTO public.countries VALUES (161, 'Sierra Leone');
        INSERT INTO public.countries VALUES (162, 'Singapore');
        INSERT INTO public.countries VALUES (163, 'Slovak Republic (Slovakia)');
        INSERT INTO public.countries VALUES (164, 'Slovenia');
        INSERT INTO public.countries VALUES (165, 'Solomon Islands');
        INSERT INTO public.countries VALUES (166, 'Somalia');
        INSERT INTO public.countries VALUES (167, 'South Africa');
        INSERT INTO public.countries VALUES (168, 'South Sudan');
        INSERT INTO public.countries VALUES (169, 'Spain');
        INSERT INTO public.countries VALUES (170, 'Sri Lanka');
        INSERT INTO public.countries VALUES (171, 'Sudan');
        INSERT INTO public.countries VALUES (172, 'Suriname');
        INSERT INTO public.countries VALUES (173, 'Sweden');
        INSERT INTO public.countries VALUES (174, 'Switzerland');
        INSERT INTO public.countries VALUES (175, 'Syria');
        INSERT INTO public.countries VALUES (176, 'Tajikistan');
        INSERT INTO public.countries VALUES (177, 'Tanzania');
        INSERT INTO public.countries VALUES (178, 'Thailand');
        INSERT INTO public.countries VALUES (179, 'Netherlands');
        INSERT INTO public.countries VALUES (180, 'Timor Leste');
        INSERT INTO public.countries VALUES (181, 'Togo');
        INSERT INTO public.countries VALUES (182, 'Trinidad & Tobago');
        INSERT INTO public.countries VALUES (183, 'Tunisia');
        INSERT INTO public.countries VALUES (184, 'Turkey');
        INSERT INTO public.countries VALUES (185, 'Turkmenistan');
        INSERT INTO public.countries VALUES (186, 'Turks & Caicos Islands');
        INSERT INTO public.countries VALUES (187, 'Uganda');
        INSERT INTO public.countries VALUES (188, 'Ukraine');
        INSERT INTO public.countries VALUES (189, 'United Arab Emirates');
        INSERT INTO public.countries VALUES (190, 'United States of America (USA)');
        INSERT INTO public.countries VALUES (191, 'Uruguay');
        INSERT INTO public.countries VALUES (192, 'Uzbekistan');
        INSERT INTO public.countries VALUES (193, 'Venezuela');
        INSERT INTO public.countries VALUES (194, 'Vietnam');
        INSERT INTO public.countries VALUES (195, 'Virgin Islands (UK)');
        INSERT INTO public.countries VALUES (196, 'Virgin Islands (US)');
        INSERT INTO public.countries VALUES (197, 'Yemen');
        INSERT INTO public.countries VALUES (198, 'Zambia');
        INSERT INTO public.countries VALUES (199, 'Zimbabwe');



        INSERT INTO public.db_patches VALUES ('CreateTopicReadinessState.sql', 'jekabskarklins', 'Adding new table for keeping track which steps have been finished when submitting proposal', '2019-10-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposals.sql', 'jekabskarklins', 'Implementing proposal shortcode', '2019-10-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalUser.sql', 'jekabskarklins', 'Implementing deleting proposal', '2019-10-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalQuestions.sql', 'jekabskarklins', 'BUGFIX can''t save large enbellishments', '2019-10-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalAnswer.sql', 'jekabskarklins', 'BUGFIX can''t save long answers', '2019-11-05 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalQuestionDependencies.sql', 'jekabskarklins', 'BUGFIX can''t save long dependencies', '2019-11-10 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterUsers.sql', 'fredrikbolmsten', 'Make user fields longer', '2019-11-13 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddPrivacyCookiePages.sql', 'fredrikbolmsten', 'Adding new pages', '2019-11-13 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddNationalitiesTable.sql', 'fredrikbolmsten', 'Adding new table for nationalities', '2019-11-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInstitutionTable.sql', 'fredrikbolmsten', 'Adding new table for institution', '2019-11-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCountryTable.sql', 'fredrikbolmsten', 'Adding new table for countries ', '2019-11-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ChangeUserTable.sql', 'fredrikbolmsten', 'link new columns to user table', '2019-11-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MigrateUsers.sql', 'fredrikbolmsten', 'Setting nationality and organisation for users', '2019-11-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterUsersEmailInvite.sql', 'fredrikbolmsten', 'Adding column for accounts created by invite', '2019-11-27 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterUserGenderLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-09 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterUserTitleLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-09 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalTitleAbstractLen.sql', 'fredrikbolmsten', 'Make proposal title longer', '2019-12-09 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalNewFields.sql', 'fredrikbolmsten', 'Adding new columns for proposals', '2020-02-15 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTechnicalReviewTable.sql', 'fredrikbolmsten', 'Adding new table for technical review ', '2020-01-23 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalQuestion.sql', 'jekabskarklins', 'Adding column nid (natural id)', '2020-02-23 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddEventLogsTable.sql', 'martintrajanovski', ' Adding new table for storing events.', '2020-03-03 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddReviewPage.sql', 'Fredrik Bolmsten', 'Add new row for reviewpage text', '2020-03-17 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSEPsTables.sql', 'martintrajanovski', 'Logging', '2020-03-28 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddExternalCommentTechRev.sql', 'fredrikbolmsten', 'Logging', '2020-03-31 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterRoleUser.sql', 'fredrikbolmsten', 'Delete user', '2020-04-01 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterEventLog.sql', 'fredrikbolmsten', 'Delete row on user removal', '2020-04-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('Create_proposal_templates_table.sql', 'jekabskarklins', 'Creating questionaries table', '2020-03-29 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('Alter_proposal_question_dependencies.sql', 'jekabskarklins', 'Adding more fields for proposal template versioning', '2020-03-29 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('Alter_calls.sql', 'jekabskarklins', 'Adding template id to call', '2020-03-29 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateQuestionsTemplateRelationTable.sql', 'jekabskarklins', 'Create table proposal_question__proposal_template__rels, and migrate data from proposal_question_dependencies', '2020-04-07 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterSEPAssgnments.sql', 'martintrajanovski', 'Change of primary key in SEP Assignments', '2020-05-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterRoleUserTable.sql', 'martintrajanovski', 'Change of primary key in role_user', '2020-05-11 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddConfigToQuestionRelsTable.sql', 'jekabskarklins', 'Adding config override column', '2020-05-11 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalAddComments.sql', 'fredrikbolmsten', 'Adding more fields for proposal', '2020-05-11 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterCallsDateFormats.sql', 'martintrajanovski', 'Change of date fields type timestamp', '2020-05-13 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalAddNotified.sql', 'fredrikbolmsten', 'Adding notified field for proposal', '2020-05-18 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateSEPProposals.sql', 'martintrajanovski', 'Create SEP proposals table and modify SEP assignments', '2020-05-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterReviewsTable.sql', 'martintrajanovski', 'Change the name to SEP_Reviews and add some columns', '2020-06-02 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterProposalTopicsDeleteOnCascade.sql', 'jekabskarklins', 'Delete topics when template is deleted', '2020-05-12 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('UpdateTableNamingConventions.sql', 'jekabskarklins', 'Updating database naming conventions for generic templates', '2020-05-25 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterTemplatesAddColumCategory.sql', 'jekabskarklins', 'Adding category ID to templates', '2020-06-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateIndexesForTemplates.sql', 'jekabskarklins', 'Adding indexes for performance', '2020-05-27 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterQuestionsAddColumnCategory.sql', 'jekabskarklins', 'Adding category ID to questions', '2020-06-10 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSubTemplateQuestionType.sql', 'jekabskarklins', 'Adding new question type', '2020-06-10 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MigrateReviewsData.sql', 'martintrajanovski', 'Migrate existing reviews to new structure', '2020-06-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateInstruments.sql', 'martintrajanovski', 'Create instruments and call_has_instrument tables', '2020-06-11 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('InstrumentHasProposals.sql', 'martintrajanovski', 'instrument_has_proposals table creation', '2020-06-22 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterQuestionariesAddCreator.sql', 'jekabskarklins', 'Add creator column to questionaries', '2020-06-22 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('InstrumentHasScientists.sql', 'martintrajanovski', 'instrument_has_scientists table creation', '2020-06-25 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterCallHasInstrument.sql', 'martintrajanovski', 'Add availability_time to call_has_instruments', '2020-06-29 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCycleDatesInCall.sql', 'martintrajanovski', 'Add start_cycle and end_cycle in call', '2020-07-01 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateSamplesTable.sql', 'jekabskarklins', 'Create samples table', '2020-07-13 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCallIdInSEPProposals.sql', 'martintrajanovski', 'Add call_id in SEP_Proposals', '2020-07-15 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddUniqueConstraintToQuestionaryId.sql', 'jekabskarklins', 'Unique constraint', '2020-07-28 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddViewForProposalTable.sql', 'fredrikbolmsten', 'Add new view for proposal table', '2020-07-28 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSampleSafetyReviewerRole.sql', 'jekabskarklins', 'Add sample safety reviewer role', '2020-07-23 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ConvertDependencyConditionToJsonb.sql', 'jekabskarklins', 'Convert field dependency to JSONB', '2020-08-03 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterAnswerHasQuestionariesCascadeOnDelete.sql', 'jekabskarklins', 'Delete entries when answer is deleted', '2020-05-12 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInstrumentSubmittedToCallHasInstruments.sql', 'martintrajanovski', 'Add submitted flag in call_has_instruments', '2020-08-25 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ConvertAnswerToJsonb.sql', 'jekabskarklins', 'Convert answer to JSONB', '2020-08-30 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterSamplesAddComment.sql', 'jekabskarklins', 'Add new column comment', '2020-09-07 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalStatusesTable.sql', 'martintrajanovski', 'Add proposals statuses table', '2020-09-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalWorkflows.sql', 'martintrajanovski', 'Add proposals workflows and connections tables', '2020-09-13 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ConvertFileUploadAnswerValueFormat.sql', 'jekabskarklins', 'Convert file upload answer value format', '2020-09-14 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSubmittedFlagToProposalsAndAddStatusConstraint.sql', 'martintrajanovski', 'Add submitted flag to proposals table and add status constraint', '2020-09-14 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ReCreateProposalsView.sql', 'martintrajanovski', 'Re-create proposals view after changes in proposal.', '2020-09-14 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSortOrderToProposalWorkflowConnections.sql', 'martintrajanovski', 'Add sort_order field to be able to sort the connections easier', '2020-09-23 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDroppableGroupIdToProposalWorkflowConnections.sql', 'martintrajanovski', 'Add droppable_group_id field to be able to group the connections easier', '2020-09-29 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddingNewQuestionDataType', 'jekabskarklins', 'Insert SAMPLE_BASIS question data type', '2020-09-30 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreatingSampleBasisQuestion', 'jekabskarklins', 'Create sample basis special question', '2020-10-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddNextStatusEvents.sql', 'martintrajanovski', 'Add proposal workflow next status events table.', '2020-10-15 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalWorkflowToCall.sql', 'martintrajanovski', 'Add proposal_workflow_id to call table', '2020-10-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalEvents.sql', 'martintrajanovski', 'Add proposal events table to keep track of all fired events on a proposal.', '2020-10-21 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0068_ConvertSubtemplateToSampleDeclaration.sql', 'jekabskarklins', 'Convert Subtemplate To Sample Declaration', '2020-10-27 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCallEndedFlagToCalls.sql', 'martintrajanovski', 'Add call_ended flag to calls', '2020-10-29 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalIdToSamples.sql', 'jekabskarklins', 'Adding columns proposal_id and question_id to samples', '2020-10-21 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddIntervalDataType.sql', 'jekabskarklins', 'Adding new question type', '2020-10-29 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddMoreEventsToProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2020-11-01 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalSampleSafeEventToProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2020-11-16 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ConvertSelectFromOptionsAnswer.sql', 'jekabskarklins', 'Convert SelectFromOptions answer to array', '2020-11-12 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalStatusShortCodeAndIsDefaultFlag.sql', 'martintrajanovski', 'Change proposal statuses table', '2020-09-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ExtendMimeTypeField.sql', 'jekabskarklins', 'Extends mime type field length', '2020-11-22 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CleanupIncompleteSanples.sql', 'jekabskarklins', 'Clean up incomplete samples and make proposal_id, question_id required', '2020-11-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('UpdateProposalView.sql', 'Peter Asztalos', 'Use SEP_Proposals for joining SEP', '2020-11-24 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MigrateFileIdsToUUID.sql', 'jekabskarklins', 'Migrate files to file_id:UUID instead of file_id::BIGINT', '2020-11-26 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInstrumentSubmittedToInstrumentHasProposals.sql', 'martintrajanovski', 'Add submitted flag in instrument_has_proposals', '2021-01-17 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddMulticolumnIndexToSamples.sql', 'Peter Asztalos', 'Add Multicolumn Index To Samples', '2021-01-10 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddNumberInputDataType.sql', 'fredrikbolmsten', 'Adding new question type', '2021-01-03 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateShipmentsTable.sql', 'jekabskarklins', 'Create shipments table', '2021-01-10 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddQuestionDependencies.sql', 'martintrajanovski', 'Store question dependencies in their own table so we can have multiple dependencies on one question.', '2021-01-11 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterSEPProposalAllocatedTime.sql', 'Peter Asztalos', 'Alter SEP_Proposals, add SEP allocated time', '2021-01-14 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateFeatureToggle.sql', 'jekabskarklins', 'Create Feature Toggle', '2021-01-12 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDependenciesOperator.sql', 'martintrajanovski', 'Question dependencies logic operator.', '2021-01-11 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddApiPermissions.sql', 'martintrajanovski', 'Api permissions to be able to control the access to the api', '2021-01-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddQuestionaryIdToProposalView.sql', 'Jekabs Karklins', 'Add questionary id to view', '2021-02-02 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddRichTextInputDataType.sql', 'Peter Asztalos', 'Add Rich Text Input Data type', '2021-02-01 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddUnits.sql', 'fredrikbolmsten', 'Adding units', '2021-02-01 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddMissingPrimaryKeys.sql', 'Peter Asztalos', 'Add missing Primary keys', '2021-02-10 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MigrateFileUploadAnswers.sql', 'martintrajanovski', 'Migrate file_upload answers to support new structure with captions', '2021-02-04 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RemoveTimeFromDateAnswers.sql', 'jekabskarklins', 'Removing time from date answers, so exact date lookups can be made', '2021-02-11 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTechnicalReviewSubmittedFlag.sql', 'martintrajanovski', 'Add submitted flag in technical_review', '2020-02-09 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('UpdateSepRelatedTables.sql', 'Peter Asztalos', 'Refactors how we store sep and user connections', '2021-02-14 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterInstrumentHasProposalTable.sql', 'Peter Asztalos', 'Alter instrument_has_proposal table so deleting a proposal will cascade delete', '2021-02-14 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddMissingProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2021-02-23 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddFeasibilityReviewUpdatedProposalEvent.sql', 'martintrajanovski', 'Add more events to proposal_events', '2021-03-03 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddManagementTimeAllocationAndManagementDecisionSubmittedFlag.sql', 'martintrajanovski', 'Add management time allocation and management decision submitted flag', '2021-03-09 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSchedulerFeatureId.sql', 'Peter Asztalos', 'Add Scheduler FeatureId', '2021-03-07 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddMoreProposalEventsAndChangeNextStatusEventsTable.sql', 'martintrajanovski', 'Add proposal_unfeasible event, change next_status_event table name and migrate data', '2021-03-16 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('Insert_Into_Proposal_Statuses_Table.sql', 'David Symons', 'Add additional Status into Proposal Statuses table', '2021-03-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalStatusUpdatedEvent.sql', 'martintrajanovski', 'Add proposal_status_updated event', '2021-03-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCallReferenceNumber.sql', 'simonfernandes', 'stfc-user-office-project#5 - Add proposal reference numbers.', '2021-02-03 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSepMeetingDecisionTable.sql', 'martintrajanovski', 'Add SEP Meeting decision table to separate data from SEP meeting decision form.', '2021-03-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalSequence.sql', 'simonfernandes', 'stfc-user-office-project#5 - Add proposal reference numbers.', '2021-02-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ChangeRankingInProposalViewTable.sql', 'martintrajanovski', 'Rank order from SEP_meeting_decisions', '2021-03-22 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MigrateProposalsRankingToSepMeetingDecisions.sql', 'martintrajanovski', 'Migrate proposals to sep meeting decisions fields', '2021-03-22 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalSepMeetingReorderedEvent.sql', 'martintrajanovski', 'Add proposal_sep_meeting_reorder event', '2021-04-05 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CleanupAfterProposalDelete.sql', 'jekabskarklins', 'Clean up data when deleting proposal', '2021-04-26 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateSettings.sql', 'Alberto Popescu', 'Create Settings', '2021-03-24 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddBeamlineManagerToInstrumentsTable.sql', 'jekabskarklins', 'Add responsible person named Beamline manager for each instrument', '2021-04-27 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddVisitationTemplate.sql', 'jekabskarklins', 'Add visitation template', '2021-05-10 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('SetAuthFeature.sql', 'Will Edwards', 'Set STFC auth to enabled', '2021-02-22 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTechnicalReviewAssigneeColumn.sql', 'jekabskarklins', 'Add technical reviewer assignee to instrument_has_proposals table', '2021-04-28 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddReviewerIdToReviewsTable.sql', 'jekabskarklins', 'Add technical reviewer id reviews table', '2021-05-03 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSepIdInProposalViewTable..sql', 'martintrajanovski', 'Add sep id to the proposal view table', '2021-05-26 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('SetAuthFeatureFalse.sql', 'jekabskarklins', 'Set STFC auth to disabled', '2021-06-02 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddAllocationTimeUnitToCallTable.sql', 'martintrajanovski', 'Add proposal allocation time unit to call table', '2021-05-30 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RenameVisitationToVisit.sql', 'jekabskarklins', 'Improve naming', '2021-06-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddAllocationTimeUnitToProposalViewTable.sql', 'martintrajanovski', 'Add proposal allocation time unit to proposal_view_table', '2021-05-30 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddFooterPageContent.sql', 'Simon Fernandes', 'Add footer content to pagetext table', '2021-06-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MakeAllRolesShortCodesConsistent.sql', 'martintrajanovski', 'Make all role short codes lowercase and consistent', '2021-06-13 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RenameProposalIdToProposalPk.sql', 'jekabskarklins', 'Rename proposal id to proposal_pk', '2021-06-13 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalReservedEvent.sql', 'martintrajanovski', 'Add proposal_reserved to proposal_events', '2021-07-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ExperimentPreparationAlterings.sql', 'jekabskarklins', 'Add column scheduled_event_id to visits table', '2021-06-01 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddThemeVariablesToSettings.sql', 'Simon Fernandes', 'Add theme variables to settings', '2021-07-07 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProfileUrlSetting.sql', 'Simon Fernandes', 'Add profile URL setting', '2021-07-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddPkForVisitsHasUsers.sql', 'Jekabs Karklins', 'Add composite primary key for visits has users', '2021-07-27 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateTableRiskAssesments.sql', 'jekabskarklins', 'Add Risk Assesments Table', '2021-07-27 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddThemeAccentVariableToSettings.sql', 'Martin Trajanovski', 'Add theme variables to settings', '2021-08-01 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('FixUniqueKeyForVisits.sql', 'Jekabs Karklins', 'Fix UNIQUE constraint for the visit table', '2021-08-01 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddScheduledEventIdToRiskAssessments.sql', 'Jekabs Karklins', 'Risk assessmenet should be attached to the experiment time', '2021-08-10 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddRiskAssessmentFeatureId.sql', 'Jekabs Karklins', 'Add Risk Assessment FeatureId', '2021-09-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddScheduledEventsTable.sql', 'Martin Trajanovski', 'Add scheduled_events table to store the scheduler information needed for the core frontend and remove the dependency', '2021-09-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTitleAndDescriptionToCall.sql', 'Panda Rushwood', 'Add title and description to call', '2021-09-15 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AdjustingTemplateCategories', 'Jekabs Karklins', 'Adjust template categories to ESI requirements', '2021-09-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ExperimentSafetyInput.sql', 'Jekabs Karklins', 'Replacing risk assessments with experiment safety input #SWAP-1835', '2021-09-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddGenericTemplate.sql', 'vyshnavidoddi', 'Adding Generic template feature', '2021-09-20 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('VisitScheduledEventIdConstraint.sql', 'Jekabs Karklins', 'Referecing scheduled_event_id from visits table', '2021-10-12 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('ESIScheduledEventIdConstraint.sql', 'Jekabs Karklins', 'Referecing scheduled_event_id from visits table', '2021-10-12 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddIsAddedAfterSubmissionFlag.sql', 'Jekabs Karklins', 'Adding flag to samples table to indicate if the sample has been added after proposal is submitted, i.e. during ESI fill out phase', '2021-10-13 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddReferenceInQuestionDependencies.sql', 'Jekabs Karklins', 'Adding reference from question_dependenies to templates_has_questions table', '2021-10-17 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RemoveOutdatedCategories.sql', 'Jekabs Karklins', 'Remove outdated categories', '2021-10-12 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreatEmailInviteFeature.sql', 'Thomas Cottee Meldrum', 'Add Email Invite Feature', '2021-10-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddManagementAllocationTimeToProposalViewTable.sql', 'martintrajanovski', 'Add proposal management allocation time to proposal_view_table', '2021-11-01 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateFeedbackDataStructures.sql', 'jekabskarklins', 'Create feedback data structures', '2021-11-15 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCallMessageToCall.sql', 'Vlad Ionica', 'Add call message to call', '2021-11-08 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTechReviewInfoToProposalViewTable.sql', 'Thomas Cottee Meldrum', 'Add techinqual review information to proposal_view_table', '2021-11-01 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCountryToInstitutions.sql', 'Fredrik Bolmsten', 'Add a country field for institutions, useful for KPI generation', '2021-12-05 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddLocalContactToScheduledEvents.sql', 'Martin Trajanovski', 'Add local contact person to the scheduled event', '2021-12-07 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddFeebackRequests.sql', 'Jekabs Karklins', 'Add feedback requests to scheduled_events', '2021-12-27 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AttachShipmentToScheduledEvent.sql', 'Jekabs Karklins', 'Associate shipment with scheduled event', '2022-01-04 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTimezoneSetting', 'Simon Fernandes', 'Add timezone setting', '2022-02-02 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateEmailSearchFeature.sql', 'Vlad Ionica', 'Create Email Search Feature', '2022-01-27 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateQuantitiesTable.sql', 'Jekabs Karklins', 'Create quantities table', '2022-01-04 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddVisitRegistrationStartEndDates.sql', 'Jekabs Karklins', 'Add visit registration start and end dates', '2022-02-22 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MigrateAnswersNumberInput.sql', 'Jekabs Karklins', 'Converting questions and answers and templates to use new unit format', '2022-01-04 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDateTimeFormatSetting', 'Martin Trajanovski', 'Add date time format setting', '2022-03-13 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddPDFTechnicalReview.sql', 'Fredrik Bolmsten', 'Add PDF upload to technical review', '2022-03-21 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterGenerateProposalShortcode.sql', 'Russell McLean', 'Altering proposal shortcode', '2022-03-16 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInstrumentScientistFeatures.sql', 'Russell McLean', 'Add Instrument Scientist Features', '2022-03-24 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AlterCommentInputDataType.sql', 'Jekabs Karklins', 'Altering SEP review comment datatype', '2022-04-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MoveTechnicalReviewAssigneeToTechnicalReviewTableAndAddNameToProposalViewTable.sql', 'Martin Trajanovski', 'Move technical_review_assignee to the technical_review table and add techinqual review assignee name to proposal_view_table', '2022-04-27 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddUserOfficerFeatures.sql', 'Russell McLean', 'Add User Officer Features', '2022-04-25 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0120_CleanupGenericTemplateQuestionaryDataAfterDelete.sql', 'Thomas Cottee Meldrum', 'Clean up data when deleting gernic template', '2022-04-11 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCallInstrumentsToProposalView.sql', 'Cosimo Campo', 'Show call instrument data in proposal view', '2022-05-15 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('NullifyActiveTemplateReferences.sql', 'Jekabs Karklins', 'Nullify references to active template', '2022-05-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RevertAddCallInstrumentsToProposalView.sql', 'Cosimo Campo', 'Revert all changes from AddCallInstrumentsToProposalView', '2022-05-31 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSEPReviewNotificationSentFlag.sql', 'Martin Trajanovski', 'Add notification email sent flag to SEP reviews', '2022-06-07 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDefaultInstrumentScientistFilters.sql', 'Vyshnavi Doddi', 'Add default instrument scientist filters', '2022-07-12 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddIsActiveCallFlag.sql', 'Martin Trajanovski', 'Add is_active flag to the calls table', '2022-06-20 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddOAuthColumns.sql', 'Jekabs Karklins', 'Add OAuth columns to the users table', '2022-07-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddEndSessionUrl.sql', 'Jekabs Karklins', 'Add setting for end session endpoint', '2022-07-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddPdfTemplateAndLinkToCall.sql', 'Simon Fernandes', 'Create PDF template table and link it to call table', '2022-07-17 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddPredefinedMessagesTable.sql', 'Martin Trajanovski', 'Add predefined_messages database table', '2022-07-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateCallHasSeps.sql', 'martintrajanovski', 'Create call_has_seps table', '2022-06-28 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddCallInternalEndDateAndEndedFlagToCalls.sql', 'Farai Mutambara', 'Add end call internal date and ended flag fields to call table', '2022-08-21 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalBookingEvents.sql', 'martintrajanovski', 'Add proposal_booking_* events', '2022-09-18 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalStatusChangedByUserEvent.sql', 'martintrajanovski', 'Add proposal_status_changed_by_user event', '2022-10-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('InsertInternalEditableSubmittedToProposalStatuses.sql', 'Farai Mutambara', 'Insert internal editable submitted into Proposal Statuses table', '2022-08-21 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalCallEndedInternalEvent.sql', 'Farai Mutambara', 'Add call ended internal field to proposal events table', '2022-08-24 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDynamicMultipleChoiceDataType.sql', 'Junjie Quan', 'Adding dynamic multiple choice type', '2023-02-08 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalDeletedEvent.sql', 'martintrajanovski', 'Add proposal_deleted event', '2023-01-23 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddRedeemCodesTable.sql', 'jekabskarklins', 'Add redeem_codes table', '2023-02-08 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTimedLogoutWarningfeature.sql', 'Thomas Cottee Meldrum', 'Create STFC idle warning feature', '2023-02-13 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddPiToProposalView.sql', 'Edward Haynes', 'Adding the PI ID to the proposal_table_view', '2023-03-19 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalClonedEvent.sql', 'martintrajanovski', 'Add proposal_cloned event', '2023-03-27 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInstrumentPickerDataType.sql', 'Yoganandan Pandiyan', 'Adding Instrument Picker type', '2023-05-20 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInternalReviewsTable.sql', 'martintrajanovski', 'Add internal_reviews table', '2023-06-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddInternalReviewerRole.sql', 'martintrajanovski', 'Add internal reviewer role', '2023-06-25 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalTemplateHeaderFooter.sql', 'Yoganandan Pandiyan', 'Adding Header and Footer to Proposal Template', '2023-07-20 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('NonIntergerGradeGrade', 'Thomas Cottee Meldrum', 'Add non interger grade', '2023-07-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddGradeGuide.sql', 'rasmiakulan', 'Add_grade_guide_specific_to_facility', '2023-08-02 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddTechnicalReviewIdToProposalView.sql', 'martintrajanovski', 'Adding the technical review ID to the proposal_table_view', '2023-06-26 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddWorkflowStatusActions.sql', 'martintrajanovski', 'Workflow status actions for executing actions on proposal specific status', '2021-01-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalWorkflowConnectionHasActions.sql', 'martintrajanovski', 'Proposal workflow connection needs to contain additional information about what action should be executed', '2021-01-25 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddWorkflowIdToProposalView.sql', 'martintrajanovski', 'Adding the workflow ID to the proposal_table_view', '2023-08-21 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDefaultWorkflowToTheDefaultCall.sql', 'martintrajanovski', 'Adding default workflow and attaching it to a call because it is required valid call to have a workflow', '2023-08-22 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalTemplateSampleDeclaration.sql', 'Yoganandan Pandiyan', 'Adding Sample Declaration to Proposal Template', '2023-09-19 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddSEPIdToCallHasInstruments.sql', 'Yoganandan Pandiyan', 'Adding SEP Id to Call Has Instruments', '2023-09-24 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalTemplateDummyData.sql', 'Yoganandan Pandiyan', 'Adding Dummy Data to Proposal Template', '2023-10-24 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RemoveExecutedColumnFromConnectionHasActions.sql', 'martintrajanovski', 'Remove the executed flag as it is not useful for now.', '2023-10-25 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalStatusActionExecutedEvent.sql', 'martintrajanovski', 'Add proposal_status_action_executed event', '2023-11-06 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddDescriptionToEventLogs.sql', 'martintrajanovski', 'Add description column to the event logs table', '2023-11-07 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RenameSEPToFAP.sql', 'martintrajanovski', 'Rename all tables and columns that used sep to fap(facility access panels)', '2023-11-16 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RemovePwdColumn.sql', 'jekabskarklins', 'Remove password column, as system is using OIDC', '2023-11-21 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RemoveEmailVerifiedColumn.sql', 'jekabskarklins', 'Remove column email_verified as it is obsolete and UOS not responsible for user management', '2023-11-16 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MultiInstrumentPerProposal.sql', 'martintrajanovski', 'Mutliple instrument per proposal', '2023-12-17 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MultipleFAPSecretary.sql', 'Thomas Cottee Meldrum', 'Multiple FAP Secretary', '2023-01-18 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RenameOrganisationColumn.sql', 'jekabskarklins', 'Rename column organisation to institution for readability and maintainability', '2023-11-16 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddProposalAnswerView.sql', 'Alex Lay', 'Add a view to simplify proposal answer access in SQL queries', '2024-02-01 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('RankReviwers.sql', 'Thomas Cottee Meldrum', 'Rank reviewers', '2023-02-08 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddRorIdToInstitutions.sql', 'Junjie Quan', 'Add a ror_id field and drop verified field for institutions as verification will be done by ROR', '2021-12-05 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('CreateOrReplaceOldUserIdWithNewFunc.SQL', 'CHI KAI LAM', 'UPDATE USER ID FOR MERGING', '2024-03-21 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddUserSearchFilterFeatureId', 'Junjie Quan', 'Add User Search filter FeatureId', '2024-03-04 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('UpdateEmailInviteFeature.sql', 'Scott Hurley', 'Update Email Invite Feature', '2024-03-17 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0151_AddMissingTechnicalReviewsOnProposalsAssignedToInstrument.sql', 'martintrajanovski', 'Add missing technical reviews on proposals that are already assigned to an instrument', '2024-03-24 23:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0151_MultipleFapPerProposal.sql', 'martintrajanovski', 'Mutliple FAP per proposal', '2024-04-02 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0152_RemoveOAuthAccessToken.sql', 'janosbabik', '', '2024-04-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0153_AlterFapProposals.sql', 'Farai Mutambara', 'Implementing deleting proposal on fap_proposals', '2024-04-09 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0153_UpdateCallTimeAllocationCheck.sql', 'Thomas Cottee Meldrum', 'Update call to take weeks as allocated time', '2024-04-08 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('MultipleFAPChair.sql', 'Thomas Cottee Meldrum', 'Multiple FAP Chair', '2024-04-23 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0155_HandleMultipleFapPerProposal', 'martintrajanovski', 'Handle mutliple FAPs per proposal', '2024-04-21 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0155_UoRecipientAppSetting.sql', 'Simon Fernandes', 'UO Recipient App Setting', '2024-05-14 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0156_AddProposalInstrumentUnsubmittedEvent', 'martintrajanovski', 'Add proposal FAP meeting instrument unsubmitted event', '2024-05-15 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0156_CreateFAPProposalView.sql', 'Thomas Cottee Meldrum', 'Create View for FAP data', '2024-04-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0156_ImproveProposalTableViewForMultiFaps.sql', 'martintrajanovski', 'Improve proposal table view for multi FAP proposals', '2024-05-28 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0157_AddTechniques.sql', 'Deepak Jaison & Simon Fernandes', 'Add techniques', '2024-06-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddFAPReviewTemplate.sql', 'Gergely Nyiri', 'Add FAP review template', '2024-06-10 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('AddFapFeasiblityReviewStatus.sql', 'tcmeldrum', 'Add proposals statuses table', '2024-07-11 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0158_AddTechniqueHasScientists.sql', 'Farai Mutambara', 'Add Technique Has Scientists', '2024-07-09 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0158_BccRecipientAppSetting.sql', 'Deepak Jaison', 'BCC Recipient App Setting', '2024-07-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0158_UpdateOldInstrumentPickerAnswers.sql', 'Bhaswati Dey', 'Update old instrument picker answers', '2024-07-22 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0159_ConflictOfInterestWarningFeature.sql', 'TCMeldrum', 'Conflict Of Interest Warning Feature', '2024-07-16 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0160_AddFilesToFapPanel.sql', 'TCMeldrum', 'Add files to a fap panel', '2024-08-05 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0160_AddSomeMissingProposalEvents', 'martintrajanovski', 'Add missing proposal FAP events', '2024-08-04 22:00:00+00', '2025-02-11 12:07:04.663875+00');
        INSERT INTO public.db_patches VALUES ('0160_OptionalTechReviewsSetting.sql', 'TCMeldrum', 'Optional Technical Reviews Setting', '2024-08-06 22:00:00+00', '2025-02-11 12:07:04.663875+00');






























        INSERT INTO public.faps VALUES (1, 'DEMAX scientific evaluation panel', 'DEMAX', 2, true, NULL, NULL, NULL);



        INSERT INTO public.features VALUES ('EMAIL_SEARCH', false, 'Search by Email functionality');
        INSERT INTO public.features VALUES ('STFC_IDLE_TIMER', false, 'STFC idle warning popup');
        INSERT INTO public.features VALUES ('USER_SEARCH_FILTER', false, 'Flag for users list filter functionality');
        INSERT INTO public.features VALUES ('SHIPPING', true, 'Shipping feature');
        INSERT INTO public.features VALUES ('SCHEDULER', true, 'Scheduler feature');
        INSERT INTO public.features VALUES ('RISK_ASSESSMENT', true, 'Risk assessment functionality');
        INSERT INTO public.features VALUES ('INSTRUMENT_MANAGEMENT', true, 'Instrument management functionality');
        INSERT INTO public.features VALUES ('TECHNICAL_REVIEW', true, 'Technical review functionality');
        INSERT INTO public.features VALUES ('USER_MANAGEMENT', true, 'User management functionality');
        INSERT INTO public.features VALUES ('VISIT_MANAGEMENT', true, 'Visit management functionality');
        INSERT INTO public.features VALUES ('SAMPLE_SAFETY', true, 'Sample safety functionality');
        INSERT INTO public.features VALUES ('OAUTH', true, 'Is OAuth enabled');
        INSERT INTO public.features VALUES ('FAP_REVIEW', true, 'FAP (facility access panels) functionality');
        INSERT INTO public.features VALUES ('EMAIL_INVITE', true, 'Email invitation functionality');
        INSERT INTO public.features VALUES ('CONFLICT_OF_INTEREST_WARNING', true, 'Show the conflict of interest Warning when assigning reviewers');















        INSERT INTO public.institutions VALUES (1, 'Other', 1, NULL);
        INSERT INTO public.institutions VALUES (2, 'A.A Baikov Institute of Metallurgy and Materials Science', 1, NULL);
        INSERT INTO public.institutions VALUES (3, 'ALBA Synchrotron Light Source', 1, NULL);
        INSERT INTO public.institutions VALUES (4, 'AGH University of Science and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (6, 'Aberystwyth University', 1, NULL);
        INSERT INTO public.institutions VALUES (8, 'Agricultural University of Athens', 1, NULL);
        INSERT INTO public.institutions VALUES (9, 'Aix-Marseille Université', 1, NULL);
        INSERT INTO public.institutions VALUES (10, 'Aristotle University of Thessaloniki', 1, NULL);
        INSERT INTO public.institutions VALUES (11, 'Arizona State University', 1, NULL);
        INSERT INTO public.institutions VALUES (12, 'Akdeniz University', 1, NULL);
        INSERT INTO public.institutions VALUES (14, 'Atomic Energy Authority of Egypt, Nuclear Research Center', 1, NULL);
        INSERT INTO public.institutions VALUES (15, 'BAM Federal Institute for Materials Research and Testing', 1, NULL);
        INSERT INTO public.institutions VALUES (16, 'Beijing University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (17, 'Bergische Universität Wuppertal', 1, NULL);
        INSERT INTO public.institutions VALUES (18, 'Bielefeld University', 1, NULL);
        INSERT INTO public.institutions VALUES (19, 'Ben-Gurion University', 1, NULL);
        INSERT INTO public.institutions VALUES (20, 'Blekinge Institute of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (21, 'Boreskov Institute of Catalysis', 1, NULL);
        INSERT INTO public.institutions VALUES (22, 'Boston University', 1, NULL);
        INSERT INTO public.institutions VALUES (23, 'Brazilian Synchrotron Light Laboratory (LNLS)', 1, NULL);
        INSERT INTO public.institutions VALUES (24, 'Brno University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (25, 'Brock University', 1, NULL);
        INSERT INTO public.institutions VALUES (27, 'CSIC - Instituto de Ciencia de Materiales de Madrid (ICMM)', 1, NULL);
        INSERT INTO public.institutions VALUES (28, 'CSIC - Instituto de Estructura de la Materia (IEM)', 1, NULL);
        INSERT INTO public.institutions VALUES (30, 'Carnegie Mellon University', 1, NULL);
        INSERT INTO public.institutions VALUES (31, 'Center for High Pressure Science & Technology Advanced Research (HPSTAR)', 1, NULL);
        INSERT INTO public.institutions VALUES (32, 'Center for Physical Sciences and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (33, 'CSIC - Instituto de Química Física Rocasolano', 1, NULL);
        INSERT INTO public.institutions VALUES (34, 'Canadian Light Source Inc.', 1, NULL);
        INSERT INTO public.institutions VALUES (35, 'Carlsberg Laboratory', 1, NULL);
        INSERT INTO public.institutions VALUES (36, 'Cardiff University', 1, NULL);
        INSERT INTO public.institutions VALUES (37, 'Center of Research and Advances Studies of the National Polytechnic Institute, (CINVESTAV-IPN)', 1, NULL);
        INSERT INTO public.institutions VALUES (38, 'Centre for Art Technological Studies and Conservation (CATS)', 1, NULL);
        INSERT INTO public.institutions VALUES (39, 'Central Research Institute of Electric Power Industry (CRIEPI)', 1, NULL);
        INSERT INTO public.institutions VALUES (40, 'Chalmers University of Technology (CTH)', 1, NULL);
        INSERT INTO public.institutions VALUES (41, 'Centro Universitario de la Defensa', 1, NULL);
        INSERT INTO public.institutions VALUES (42, 'Centro Atomico Bariloche (CNEA)', 1, NULL);
        INSERT INTO public.institutions VALUES (43, 'Charles University in Prague', 1, NULL);
        INSERT INTO public.institutions VALUES (44, 'Chiba University', 1, NULL);
        INSERT INTO public.institutions VALUES (45, 'Chinese Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (46, 'CiC nanoGUNE Consolider', 1, NULL);
        INSERT INTO public.institutions VALUES (47, 'Copenhagen University Hospital Hvidovre', 1, NULL);
        INSERT INTO public.institutions VALUES (48, 'Cornell University', 1, NULL);
        INSERT INTO public.institutions VALUES (49, 'Cukurova University', 1, NULL);
        INSERT INTO public.institutions VALUES (50, 'Consejo Superior de Investigaciones Cientificas', 1, NULL);
        INSERT INTO public.institutions VALUES (51, 'Daresbury Laboratory', 1, NULL);
        INSERT INTO public.institutions VALUES (52, 'Delft University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (53, 'Democritus University of Thrace', 1, NULL);
        INSERT INTO public.institutions VALUES (54, 'Deutsches Elektronen-Synchrotron DESY', 1, NULL);
        INSERT INTO public.institutions VALUES (55, 'Diamond Light Source', 1, NULL);
        INSERT INTO public.institutions VALUES (56, 'Drexel University', 1, NULL);
        INSERT INTO public.institutions VALUES (57, 'Donostia International Physics Center (DIPC)', 1, NULL);
        INSERT INTO public.institutions VALUES (58, 'Dublin City University', 1, NULL);
        INSERT INTO public.institutions VALUES (59, 'Durham University', 1, NULL);
        INSERT INTO public.institutions VALUES (60, 'Duke University', 1, NULL);
        INSERT INTO public.institutions VALUES (61, 'Dongguk University', 1, NULL);
        INSERT INTO public.institutions VALUES (62, 'EMBL Hamburg', 1, NULL);
        INSERT INTO public.institutions VALUES (63, 'European Synchrotron Radiation Facility (ESRF)', 1, NULL);
        INSERT INTO public.institutions VALUES (64, 'ETH Zürich', 1, NULL);
        INSERT INTO public.institutions VALUES (65, 'ELI Beamlines', 1, NULL);
        INSERT INTO public.institutions VALUES (66, 'EMBL Grenoble', 1, NULL);
        INSERT INTO public.institutions VALUES (67, 'ESPCI ParisTech', 1, NULL);
        INSERT INTO public.institutions VALUES (68, 'Swiss Federal Institute of Aquatic Science and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (69, 'Eberhard Karls Universität Tübingen', 1, NULL);
        INSERT INTO public.institutions VALUES (70, 'Ecole Polytechnique Federale de Lausanne', 1, NULL);
        INSERT INTO public.institutions VALUES (71, 'Eindhoven University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (72, 'Elettra-Sincrotrone Trieste', 1, NULL);
        INSERT INTO public.institutions VALUES (73, 'Eli-alps Research Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (74, 'Escuela Superior de Ingenieria Quimica e Industrias Extractivas (ESIQIE-IPN)', 1, NULL);
        INSERT INTO public.institutions VALUES (75, 'European Institute for Energy Research (EIFER)', 1, NULL);
        INSERT INTO public.institutions VALUES (76, 'European Organisation for Nuclear Research (CERN)', 1, NULL);
        INSERT INTO public.institutions VALUES (77, 'European XFEL GmbH', 1, NULL);
        INSERT INTO public.institutions VALUES (79, 'Federal University of Rio Grande do Sul', 1, NULL);
        INSERT INTO public.institutions VALUES (81, 'Firc Institute of Molecular Oncology Foundation, European Institute of Oncology - IFOM-IEO', 1, NULL);
        INSERT INTO public.institutions VALUES (82, 'Freie Universität Berlin', 1, NULL);
        INSERT INTO public.institutions VALUES (83, 'Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)', 1, NULL);
        INSERT INTO public.institutions VALUES (84, 'Fritz-Haber-Institut der Max-Planck-Gesellschaft', 1, NULL);
        INSERT INTO public.institutions VALUES (85, 'Friedrich Schiller University Jena', 1, NULL);
        INSERT INTO public.institutions VALUES (86, 'Fudan University', 1, NULL);
        INSERT INTO public.institutions VALUES (87, 'GKSS Research Centre Geesthacht', 1, NULL);
        INSERT INTO public.institutions VALUES (88, 'Fujian Institute of Research on the Structure of Matter', 1, NULL);
        INSERT INTO public.institutions VALUES (89, 'GW Krieger School', 1, NULL);
        INSERT INTO public.institutions VALUES (90, 'Gdansk University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (91, 'Geologic Survey of Denmark and Greenland (GEUS)', 1, NULL);
        INSERT INTO public.institutions VALUES (92, 'Geological Survey of Norway (NGU)', 1, NULL);
        INSERT INTO public.institutions VALUES (93, 'Georg-August-Universität Göttingen', 1, NULL);
        INSERT INTO public.institutions VALUES (94, 'Georgia Institute of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (95, 'Ghent University', 1, NULL);
        INSERT INTO public.institutions VALUES (96, 'George Washington University', 1, NULL);
        INSERT INTO public.institutions VALUES (97, 'Goethe Universität Frankfurt', 1, NULL);
        INSERT INTO public.institutions VALUES (98, 'Hagedorn Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (99, 'Halmstad University', 1, NULL);
        INSERT INTO public.institutions VALUES (100, 'Hannover Medical School (MHH)', 1, NULL);
        INSERT INTO public.institutions VALUES (101, 'HIST, Sør-Trøndelag University College', 1, NULL);
        INSERT INTO public.institutions VALUES (102, 'Gwangju Institute of Science and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (103, 'Helmholtz Centre for Infection Research', 1, NULL);
        INSERT INTO public.institutions VALUES (104, 'Helmholtz-Zentrum Berlin', 1, NULL);
        INSERT INTO public.institutions VALUES (105, 'Hellenic Pasteur Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (106, 'Helmholtz-Zentrum Geesthacht', 1, NULL);
        INSERT INTO public.institutions VALUES (107, 'Hindustan University', 1, NULL);
        INSERT INTO public.institutions VALUES (108, 'Hiroshima University', 1, NULL);
        INSERT INTO public.institutions VALUES (109, 'Humboldt Universität zu Berlin', 1, NULL);
        INSERT INTO public.institutions VALUES (110, 'ICMAB-CSIC', 1, NULL);
        INSERT INTO public.institutions VALUES (111, 'IMARES, Institute for Marine Resources and Ecosystem Studies', 1, NULL);
        INSERT INTO public.institutions VALUES (112, 'IRCCS Ospedale San Raffaele', 1, NULL);
        INSERT INTO public.institutions VALUES (113, 'Hokkaido University', 1, NULL);
        INSERT INTO public.institutions VALUES (114, 'IRCER - Institut de Recherche sur les Céramiques', 1, NULL);
        INSERT INTO public.institutions VALUES (115, 'IRELEC-ALCEN', 1, NULL);
        INSERT INTO public.institutions VALUES (116, 'ITMO University', 1, NULL);
        INSERT INTO public.institutions VALUES (117, 'ISSP RAS', 1, NULL);
        INSERT INTO public.institutions VALUES (118, 'Indian Institute of Science (IISc)', 1, NULL);
        INSERT INTO public.institutions VALUES (119, 'Indian Association for the Cultivation of Science', 1, NULL);
        INSERT INTO public.institutions VALUES (120, 'Imperial College London', 1, NULL);
        INSERT INTO public.institutions VALUES (121, 'Immanuel Kant Baltic Federal University (IK BFU)', 1, NULL);
        INSERT INTO public.institutions VALUES (122, 'Indian Institute of Technology (BHU)', 1, NULL);
        INSERT INTO public.institutions VALUES (123, 'Indian Institute of Technology Bombay', 1, NULL);
        INSERT INTO public.institutions VALUES (124, 'Insituto de Tecnologia Quimica e Biologia (ITQB)', 1, NULL);
        INSERT INTO public.institutions VALUES (126, 'Institut d´Electronique de Microelectronique et de Nanotechnologie', 1, NULL);
        INSERT INTO public.institutions VALUES (127, 'Institut de Biologie Structurale (IBS)', 1, NULL);
        INSERT INTO public.institutions VALUES (128, 'Institut de Physique et Chemie des Materiaux de Strasbourg (IPCMS)', 1, NULL);
        INSERT INTO public.institutions VALUES (129, 'Institute for Clinical Sciences Malmö, Lund University', 1, NULL);
        INSERT INTO public.institutions VALUES (130, 'Institute for Stem Cell Biology and Regenerative Medicine (inStem) ', 1, NULL);
        INSERT INTO public.institutions VALUES (131, 'Institute for Energy Technology (IFE)', 1, NULL);
        INSERT INTO public.institutions VALUES (132, 'Institute for Research in Biomedicine (IRB Barcelona)', 1, NULL);
        INSERT INTO public.institutions VALUES (133, 'Institute of Advanced Chemistry of Catalonia', 1, NULL);
        INSERT INTO public.institutions VALUES (134, 'Institute of Biochemistry', 1, NULL);
        INSERT INTO public.institutions VALUES (135, 'Institute of Nuclear Research', 1, NULL);
        INSERT INTO public.institutions VALUES (136, 'Institute of Organic Chemistry, Polish Academy of Science', 1, NULL);
        INSERT INTO public.institutions VALUES (137, 'Institute of Physics Belgrade', 1, NULL);
        INSERT INTO public.institutions VALUES (138, 'Institute of Physics of the Czech Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (139, 'Institute of Bioorganic Chemistry, Polish Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (140, 'Institute of Nuclear Chemistry and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (141, 'Institute of Physics, Polish Academy of Science', 1, NULL);
        INSERT INTO public.institutions VALUES (142, 'Institute of Protein Research RAS', 1, NULL);
        INSERT INTO public.institutions VALUES (143, 'Instituto Madrileno de Estudios Avanzados IMDEA Nanociencia', 1, NULL);
        INSERT INTO public.institutions VALUES (144, 'Instituto Superior Tecnico', 1, NULL);
        INSERT INTO public.institutions VALUES (145, 'Institute of Plasma Physics and Laser Microfusion', 1, NULL);
        INSERT INTO public.institutions VALUES (146, 'Instituto de Ciencia de Materiales de Aragon - CSIC - Universidad de Zaragoza', 1, NULL);
        INSERT INTO public.institutions VALUES (147, 'Internationella Engelska Gymnasiet Södermalm (IEGS)', 1, NULL);
        INSERT INTO public.institutions VALUES (148, 'Irkutsk State University', 1, NULL);
        INSERT INTO public.institutions VALUES (149, 'Istituto di Metodologie Inorganiche e dei Plasmi - CNR-IMIP', 1, NULL);
        INSERT INTO public.institutions VALUES (150, 'Ivan Franko National University of Lviv', 1, NULL);
        INSERT INTO public.institutions VALUES (151, 'Jagiellonian University', 1, NULL);
        INSERT INTO public.institutions VALUES (152, 'Istituto Italiano di Tecnologia (IIT)', 1, NULL);
        INSERT INTO public.institutions VALUES (153, 'Istituto Officina dei Materiali IOM-CNR', 1, NULL);
        INSERT INTO public.institutions VALUES (154, 'Istituto di Struttura della Materia - CNR', 1, NULL);
        INSERT INTO public.institutions VALUES (156, 'Japan Advanced Institute of Science and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (157, 'Jerzy Haber Institute of Catalysis and Surface Chemistry, Polish Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (158, 'Johannes Gutenberg-University Mainz', 1, NULL);
        INSERT INTO public.institutions VALUES (159, 'Japan Synchrotron Radiation Research Institute (JASRI)', 1, NULL);
        INSERT INTO public.institutions VALUES (160, 'Justus-Liebig-Universität Giessen', 1, NULL);
        INSERT INTO public.institutions VALUES (161, 'K.U. Leuven', 1, NULL);
        INSERT INTO public.institutions VALUES (162, 'Karl-Franzens University', 1, NULL);
        INSERT INTO public.institutions VALUES (163, 'Jozef Stefan Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (164, 'Karlsruhe Insitute of Technology (KIT)', 1, NULL);
        INSERT INTO public.institutions VALUES (165, 'Karlstad University', 1, NULL);
        INSERT INTO public.institutions VALUES (166, 'Karolinska Institutet', 1, NULL);
        INSERT INTO public.institutions VALUES (167, 'Keio University', 1, NULL);
        INSERT INTO public.institutions VALUES (168, 'Keuka College', 1, NULL);
        INSERT INTO public.institutions VALUES (169, 'Kharkov Institute of Physics and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (170, 'Kiev National T. Shevchenko University', 1, NULL);
        INSERT INTO public.institutions VALUES (171, 'King Abdullah University of Science and Technology (KAUST)', 1, NULL);
        INSERT INTO public.institutions VALUES (172, 'Keele University', 1, NULL);
        INSERT INTO public.institutions VALUES (173, 'Koç University', 1, NULL);
        INSERT INTO public.institutions VALUES (174, 'Kumamoto University', 1, NULL);
        INSERT INTO public.institutions VALUES (175, 'Korea Advanced Institute of Science and Technology (KAIST)', 1, NULL);
        INSERT INTO public.institutions VALUES (176, 'La Trobe University', 1, NULL);
        INSERT INTO public.institutions VALUES (177, 'Laboratoire Léon Brillouin', 1, NULL);
        INSERT INTO public.institutions VALUES (178, 'Laboratoire des Materiaux, Surfaces et Procedes pour la Catalyse (LMSPC-UMR)', 1, NULL);
        INSERT INTO public.institutions VALUES (179, 'Latvian Biomedical Research and Study Centre', 1, NULL);
        INSERT INTO public.institutions VALUES (180, 'Latvian Institute of Organic Synthesis', 1, NULL);
        INSERT INTO public.institutions VALUES (181, 'Laboratori Nazionali di Frascati - INFN', 1, NULL);
        INSERT INTO public.institutions VALUES (182, 'Lawrence Berkeley National Laboratory, Advanced Light Source (ALS)', 1, NULL);
        INSERT INTO public.institutions VALUES (183, 'Laboratorio de Estudios Cristalograficos', 1, NULL);
        INSERT INTO public.institutions VALUES (184, 'Leibnitz Institute for Solid State and Materials Research, IFW', 1, NULL);
        INSERT INTO public.institutions VALUES (185, 'Laboratoire de Chimie Physique - Matière et rayonnement, CNRS & SU', 1, NULL);
        INSERT INTO public.institutions VALUES (186, 'Leibniz University Hannover', 1, NULL);
        INSERT INTO public.institutions VALUES (187, 'Leiden University', 1, NULL);
        INSERT INTO public.institutions VALUES (188, 'Linköping University', 1, NULL);
        INSERT INTO public.institutions VALUES (189, 'Linnaeus University', 1, NULL);
        INSERT INTO public.institutions VALUES (190, 'Leibniz-Institut für innovative Mikroelektronik IHP', 1, NULL);
        INSERT INTO public.institutions VALUES (191, 'Luleå University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (192, 'Ludwig-Maximilians-Universität München', 1, NULL);
        INSERT INTO public.institutions VALUES (194, 'Los Alamos National Laboratory', 1, NULL);
        INSERT INTO public.institutions VALUES (195, 'Macquarie University', 1, NULL);
        INSERT INTO public.institutions VALUES (196, 'Massey University', 1, NULL);
        INSERT INTO public.institutions VALUES (197, 'Massachusetts Institute of Technology (MIT)', 1, NULL);
        INSERT INTO public.institutions VALUES (198, 'Max Delbrück Center for Molecular Medicine in the Helmholtz Association (MDC)', 1, NULL);
        INSERT INTO public.institutions VALUES (199, 'Max F. Perutz Laboratories (MFPL)', 1, NULL);
        INSERT INTO public.institutions VALUES (200, 'Max Planck Institut für Kernphysik', 1, NULL);
        INSERT INTO public.institutions VALUES (201, 'Max Planck Institut für Plasmaphysik', 1, NULL);
        INSERT INTO public.institutions VALUES (202, 'Malmö University', 1, NULL);
        INSERT INTO public.institutions VALUES (203, 'Manchester Metropolitan University', 1, NULL);
        INSERT INTO public.institutions VALUES (204, 'Maria Curie-Sklodowska University', 1, NULL);
        INSERT INTO public.institutions VALUES (205, 'Martin-Luther-Universität Halle-Wittenberg', 1, NULL);
        INSERT INTO public.institutions VALUES (206, 'Max Planck Institut für Kohlenforschung', 1, NULL);
        INSERT INTO public.institutions VALUES (207, 'Max Planck Institute for Chemical Energy Conversion', 1, NULL);
        INSERT INTO public.institutions VALUES (208, 'Max Planck Institute for Biophysical Chemistry', 1, NULL);
        INSERT INTO public.institutions VALUES (209, 'Max Planck Institute for Chemical Physics of Solids', 1, NULL);
        INSERT INTO public.institutions VALUES (210, 'Max Planck Institute for Medical Research', 1, NULL);
        INSERT INTO public.institutions VALUES (211, 'Max Planck Institute for Metals Research', 1, NULL);
        INSERT INTO public.institutions VALUES (212, 'Max Planck Institute for Polymer Research', 1, NULL);
        INSERT INTO public.institutions VALUES (213, 'Max Planck Institute for Solid State Research', 1, NULL);
        INSERT INTO public.institutions VALUES (214, 'Maynooth University', 1, NULL);
        INSERT INTO public.institutions VALUES (215, 'Mersin University', 1, NULL);
        INSERT INTO public.institutions VALUES (216, 'Max Planck Institute of Colloids and Interfaces', 1, NULL);
        INSERT INTO public.institutions VALUES (217, 'Monash University', 1, NULL);
        INSERT INTO public.institutions VALUES (218, 'Military University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (220, 'Montanuniversität Leoben', 1, NULL);
        INSERT INTO public.institutions VALUES (221, 'Moscow Institute of Physics and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (222, 'Moscow State University', 1, NULL);
        INSERT INTO public.institutions VALUES (223, 'NORDITA, the Nordic Institute for Theoretical Physics', 1, NULL);
        INSERT INTO public.institutions VALUES (224, 'Moscow Engineering Physics Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (225, 'NIMBE - Nanosciences et Innovation pour les Matériaux la Biomédecine et l´Énergie', 1, NULL);
        INSERT INTO public.institutions VALUES (226, 'Nagoya Institute of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (227, 'National Hellenic Research Foundation', 1, NULL);
        INSERT INTO public.institutions VALUES (228, 'National Food Research Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (229, 'National Cheng Kung University', 1, NULL);
        INSERT INTO public.institutions VALUES (230, 'Nencki Institute of Experimental Biology', 1, NULL);
        INSERT INTO public.institutions VALUES (231, 'National University of Science and Technology (MISIS)', 1, NULL);
        INSERT INTO public.institutions VALUES (232, 'National Institute for Medical Research', 1, NULL);
        INSERT INTO public.institutions VALUES (233, 'Newcastle University', 1, NULL);
        INSERT INTO public.institutions VALUES (234, 'Nikolaev Institute of Inorganic Chemistry', 1, NULL);
        INSERT INTO public.institutions VALUES (235, 'Norwegian University of Life Sciences (NMBU)', 1, NULL);
        INSERT INTO public.institutions VALUES (236, 'Northwestern University', 1, NULL);
        INSERT INTO public.institutions VALUES (237, 'New Mexico State University', 1, NULL);
        INSERT INTO public.institutions VALUES (238, 'Norwegian University of Science and Technology (NTNU)', 1, NULL);
        INSERT INTO public.institutions VALUES (239, 'Oregon State University', 1, NULL);
        INSERT INTO public.institutions VALUES (240, 'Okinawa Institute of Science and Technology Graduate University (OIST)', 1, NULL);
        INSERT INTO public.institutions VALUES (241, 'Osaka University', 1, NULL);
        INSERT INTO public.institutions VALUES (242, 'P.N. Lebedev Physical Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (243, 'Paul Scherrer Institute (PSI)', 1, NULL);
        INSERT INTO public.institutions VALUES (245, 'Pavol Josef Šafárik University in Košice', 1, NULL);
        INSERT INTO public.institutions VALUES (246, 'Penn State University', 1, NULL);
        INSERT INTO public.institutions VALUES (247, 'Philipps-University Marburg', 1, NULL);
        INSERT INTO public.institutions VALUES (248, 'Peter the Great St. Petersburg Polytechnic University', 1, NULL);
        INSERT INTO public.institutions VALUES (249, 'Peking University', 1, NULL);
        INSERT INTO public.institutions VALUES (250, 'Pohang University of Science and Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (251, 'Polytechnic University of Marche', 1, NULL);
        INSERT INTO public.institutions VALUES (252, 'Princeton University', 1, NULL);
        INSERT INTO public.institutions VALUES (253, 'Purdue University', 1, NULL);
        INSERT INTO public.institutions VALUES (254, 'RISE Research Institute of Sweden', 1, NULL);
        INSERT INTO public.institutions VALUES (255, 'RMIT University', 1, NULL);
        INSERT INTO public.institutions VALUES (256, 'Rice University', 1, NULL);
        INSERT INTO public.institutions VALUES (257, 'Quanzhou Normal University', 1, NULL);
        INSERT INTO public.institutions VALUES (258, 'Queen Mary University of London', 1, NULL);
        INSERT INTO public.institutions VALUES (259, 'Risø National Laboratory for Sustainable Energy- DTU', 1, NULL);
        INSERT INTO public.institutions VALUES (261, 'Riga Technical University', 1, NULL);
        INSERT INTO public.institutions VALUES (262, 'Rudjer Boskovic Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (263, 'Ruhr-University Bochum', 1, NULL);
        INSERT INTO public.institutions VALUES (266, 'Rzhanov Institute of Semiconductor Physics', 1, NULL);
        INSERT INTO public.institutions VALUES (267, 'SCK-CEN, Belgian Nuclear Research Centre', 1, NULL);
        INSERT INTO public.institutions VALUES (268, 'Russian Research Centre', 1, NULL);
        INSERT INTO public.institutions VALUES (269, 'SESAME Synchrotron', 1, NULL);
        INSERT INTO public.institutions VALUES (270, 'SIK, the Swedish Institute for Food and Biotechnology', 1, NULL);
        INSERT INTO public.institutions VALUES (271, 'SINTEF Materials and Chemistry', 1, NULL);
        INSERT INTO public.institutions VALUES (272, 'SLAC National Accelerator Laboratory', 1, NULL);
        INSERT INTO public.institutions VALUES (273, 'SOLEIL Synchrotron', 1, NULL);
        INSERT INTO public.institutions VALUES (274, 'SP Technical Research Institute of Sweden', 1, NULL);
        INSERT INTO public.institutions VALUES (275, 'SPCTS - Science of Ceramic Processing and Surface Treatment', 1, NULL);
        INSERT INTO public.institutions VALUES (276, 'Saha Institute of Nuclear Physics', 1, NULL);
        INSERT INTO public.institutions VALUES (277, 'Sahlgrenska Academy at the University of Gothenburg', 1, NULL);
        INSERT INTO public.institutions VALUES (278, 'Shanghai Jiao Tong University', 1, NULL);
        INSERT INTO public.institutions VALUES (279, 'Shanghai Institute of Applied Physics, Chinese Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (280, 'Shaanxi Normal University', 1, NULL);
        INSERT INTO public.institutions VALUES (281, 'ShanghaiTech Uiversity', 1, NULL);
        INSERT INTO public.institutions VALUES (282, 'Shenyang Agricultural University', 1, NULL);
        INSERT INTO public.institutions VALUES (283, 'Slovak Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (284, 'South China University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (285, 'Southeast University', 1, NULL);
        INSERT INTO public.institutions VALUES (286, 'South Westphalia University of Applied Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (287, 'Southern Federal University', 1, NULL);
        INSERT INTO public.institutions VALUES (288, 'Southern University of Science and Technology (SUSTech)', 1, NULL);
        INSERT INTO public.institutions VALUES (290, 'Statens Serum Institut', 1, NULL);
        INSERT INTO public.institutions VALUES (291, 'Stony Brook University', 1, NULL);
        INSERT INTO public.institutions VALUES (292, 'Sveriges Geologiska Undersökning (SGU)', 1, NULL);
        INSERT INTO public.institutions VALUES (293, 'Swedish Defence Research Agency (FOI)', 1, NULL);
        INSERT INTO public.institutions VALUES (294, 'Swedish Geotechnical Institute (SGI)', 1, NULL);
        INSERT INTO public.institutions VALUES (295, 'Swedish Museum of Natural History', 1, NULL);
        INSERT INTO public.institutions VALUES (296, 'Swedish Army Research Agency', 1, NULL);
        INSERT INTO public.institutions VALUES (297, 'Swedish University of Agricultural Sciences (SLU), Alnarp', 1, NULL);
        INSERT INTO public.institutions VALUES (298, 'Swedish Orphan Biovitrum', 1, NULL);
        INSERT INTO public.institutions VALUES (299, 'Swedish University of Agricultural Sciences (SLU), Umeå', 1, NULL);
        INSERT INTO public.institutions VALUES (300, 'Swedish University of Agricultural Sciences (SLU), Uppsala', 1, NULL);
        INSERT INTO public.institutions VALUES (302, 'Tarbiat Modares University', 1, NULL);
        INSERT INTO public.institutions VALUES (303, 'TU Bergakademie Freiberg', 1, NULL);
        INSERT INTO public.institutions VALUES (304, 'Szczecin Technical University', 1, NULL);
        INSERT INTO public.institutions VALUES (305, 'Technical University of Denmark (DTU)', 1, NULL);
        INSERT INTO public.institutions VALUES (306, 'Technical University of Kaiserslautern', 1, NULL);
        INSERT INTO public.institutions VALUES (307, 'Technical University of Košice', 1, NULL);
        INSERT INTO public.institutions VALUES (308, 'Technical University of Lodz', 1, NULL);
        INSERT INTO public.institutions VALUES (309, 'Technische Universität Dresden', 1, NULL);
        INSERT INTO public.institutions VALUES (310, 'Technion - Israel Institute of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (311, 'Technische Universität Berlin', 1, NULL);
        INSERT INTO public.institutions VALUES (312, 'Technische Universität Chemnitz', 1, NULL);
        INSERT INTO public.institutions VALUES (313, 'Technische Universität München', 1, NULL);
        INSERT INTO public.institutions VALUES (314, 'Tel Aviv University', 1, NULL);
        INSERT INTO public.institutions VALUES (315, 'Tele and Radio Research Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (316, 'Tetra Pak', 1, NULL);
        INSERT INTO public.institutions VALUES (317, 'The Andrzej Soltan Institute for Nuclear Studies', 1, NULL);
        INSERT INTO public.institutions VALUES (318, 'The Hebrew University', 1, NULL);
        INSERT INTO public.institutions VALUES (319, 'The Hashemite University', 1, NULL);
        INSERT INTO public.institutions VALUES (320, 'Technische Universität Wien', 1, NULL);
        INSERT INTO public.institutions VALUES (321, 'The University of Tokyo', 1, NULL);
        INSERT INTO public.institutions VALUES (322, 'The Open University', 1, NULL);
        INSERT INTO public.institutions VALUES (323, 'The University of New South Wales', 1, NULL);
        INSERT INTO public.institutions VALUES (324, 'The University of Tokyo, Outstation SPring-8', 1, NULL);
        INSERT INTO public.institutions VALUES (325, 'Tomsk Polytechnic University ', 1, NULL);
        INSERT INTO public.institutions VALUES (326, 'The Novo Nordisk Foundation Center for Protein Research', 1, NULL);
        INSERT INTO public.institutions VALUES (327, 'Trinity College Dublin', 1, NULL);
        INSERT INTO public.institutions VALUES (328, 'UNICAMP, University of Campinas', 1, NULL);
        INSERT INTO public.institutions VALUES (329, 'UMONS University of Mons', 1, NULL);
        INSERT INTO public.institutions VALUES (331, 'UCIBIO - Applied Molecular Biosciences Unit', 1, NULL);
        INSERT INTO public.institutions VALUES (332, 'Universidad Autonoma de Madrid', 1, NULL);
        INSERT INTO public.institutions VALUES (333, 'Universidad Nacional Autonoma de Mexico (UNAM)', 1, NULL);
        INSERT INTO public.institutions VALUES (334, 'Universidad Complutense de Madrid', 1, NULL);
        INSERT INTO public.institutions VALUES (335, 'Universidad Politecnica de Madrid', 1, NULL);
        INSERT INTO public.institutions VALUES (336, 'Universidad de Valencia', 1, NULL);
        INSERT INTO public.institutions VALUES (337, 'Universidade Federal da Bahia', 1, NULL);
        INSERT INTO public.institutions VALUES (338, 'Universidade de Sao Paulo', 1, NULL);
        INSERT INTO public.institutions VALUES (339, 'Universita degli Studi di Milano', 1, NULL);
        INSERT INTO public.institutions VALUES (340, 'Universita degli Studi di Palermo', 1, NULL);
        INSERT INTO public.institutions VALUES (341, 'Universita degli Studi di Torino', 1, NULL);
        INSERT INTO public.institutions VALUES (342, 'Universita degli Studi Roma TRE', 1, NULL);
        INSERT INTO public.institutions VALUES (343, 'Universite Claude Bernard Lyon 1', 1, NULL);
        INSERT INTO public.institutions VALUES (344, 'Universite Montpellier II', 1, NULL);
        INSERT INTO public.institutions VALUES (345, 'Universite Paris 13', 1, NULL);
        INSERT INTO public.institutions VALUES (346, 'Universite Paris Sud', 1, NULL);
        INSERT INTO public.institutions VALUES (347, 'Universitat Autonoma de Barcelona', 1, NULL);
        INSERT INTO public.institutions VALUES (348, 'Universite Paris Sud 11', 1, NULL);
        INSERT INTO public.institutions VALUES (349, 'Universite Pierre et Marie Curie - Paris VI', 1, NULL);
        INSERT INTO public.institutions VALUES (350, 'Universite d Orleans', 1, NULL);
        INSERT INTO public.institutions VALUES (351, 'Universite de Cergy-Pontoise', 1, NULL);
        INSERT INTO public.institutions VALUES (352, 'Universite de Strasbourg', 1, NULL);
        INSERT INTO public.institutions VALUES (353, 'Universite Paris-Sud', 1, NULL);
        INSERT INTO public.institutions VALUES (354, 'University College Dublin', 1, NULL);
        INSERT INTO public.institutions VALUES (355, 'University Medical Centre Göttingen', 1, NULL);
        INSERT INTO public.institutions VALUES (356, 'University of Alicante', 1, NULL);
        INSERT INTO public.institutions VALUES (357, 'University of Antwerp', 1, NULL);
        INSERT INTO public.institutions VALUES (358, 'University of Amsterdam', 1, NULL);
        INSERT INTO public.institutions VALUES (360, 'University of Babes-Bolyai', 1, NULL);
        INSERT INTO public.institutions VALUES (361, 'University of Barcelona', 1, NULL);
        INSERT INTO public.institutions VALUES (362, 'University of Bayreuth', 1, NULL);
        INSERT INTO public.institutions VALUES (364, 'University of Athens', 1, NULL);
        INSERT INTO public.institutions VALUES (365, 'University of Basel', 1, NULL);
        INSERT INTO public.institutions VALUES (366, 'University of Bath', 1, NULL);
        INSERT INTO public.institutions VALUES (367, 'University of Bialystok', 1, NULL);
        INSERT INTO public.institutions VALUES (369, 'University of Bordeaux', 1, NULL);
        INSERT INTO public.institutions VALUES (370, 'University of Bradford', 1, NULL);
        INSERT INTO public.institutions VALUES (371, 'University of Brasilia', 1, NULL);
        INSERT INTO public.institutions VALUES (372, 'University of Bremen', 1, NULL);
        INSERT INTO public.institutions VALUES (373, 'University of Brighton', 1, NULL);
        INSERT INTO public.institutions VALUES (374, 'University of Bristol', 1, NULL);
        INSERT INTO public.institutions VALUES (375, 'University of California, Los Angeles', 1, NULL);
        INSERT INTO public.institutions VALUES (376, 'University of California, Santa Barbara', 1, NULL);
        INSERT INTO public.institutions VALUES (377, 'University of Cambridge', 1, NULL);
        INSERT INTO public.institutions VALUES (378, 'University of Bordeaux', 1, NULL);
        INSERT INTO public.institutions VALUES (380, 'University of Coimbra', 1, NULL);
        INSERT INTO public.institutions VALUES (381, 'University of Colorado', 1, NULL);
        INSERT INTO public.institutions VALUES (382, 'University of Connecticut', 1, NULL);
        INSERT INTO public.institutions VALUES (384, 'University of Central Florida', 1, NULL);
        INSERT INTO public.institutions VALUES (385, 'University of Central Lancashire', 1, NULL);
        INSERT INTO public.institutions VALUES (386, 'University of Cordoba', 1, NULL);
        INSERT INTO public.institutions VALUES (387, 'University of Eastern Finland', 1, NULL);
        INSERT INTO public.institutions VALUES (388, 'University of Dundee', 1, NULL);
        INSERT INTO public.institutions VALUES (389, 'University of East Anglia', 1, NULL);
        INSERT INTO public.institutions VALUES (390, 'University of Edinburgh', 1, NULL);
        INSERT INTO public.institutions VALUES (391, 'University of Freiburg', 1, NULL);
        INSERT INTO public.institutions VALUES (392, 'University of Fribourg', 1, NULL);
        INSERT INTO public.institutions VALUES (393, 'University of Gdansk', 1, NULL);
        INSERT INTO public.institutions VALUES (394, 'University of Geneva', 1, NULL);
        INSERT INTO public.institutions VALUES (395, 'University of Glasgow', 1, NULL);
        INSERT INTO public.institutions VALUES (396, 'University of Florida', 1, NULL);
        INSERT INTO public.institutions VALUES (397, 'University of Gothenburg', 1, NULL);
        INSERT INTO public.institutions VALUES (398, 'University of Helsinki', 1, NULL);
        INSERT INTO public.institutions VALUES (399, 'University of Greifswald', 1, NULL);
        INSERT INTO public.institutions VALUES (400, 'University of Groningen', 1, NULL);
        INSERT INTO public.institutions VALUES (401, 'University of Iceland', 1, NULL);
        INSERT INTO public.institutions VALUES (402, 'University of Illinois', 1, NULL);
        INSERT INTO public.institutions VALUES (403, 'University of Innsbruck', 1, NULL);
        INSERT INTO public.institutions VALUES (404, 'University of Ioannina', 1, NULL);
        INSERT INTO public.institutions VALUES (405, 'University of Hyogo', 1, NULL);
        INSERT INTO public.institutions VALUES (406, 'University of Jordan', 1, NULL);
        INSERT INTO public.institutions VALUES (407, 'University of Jyväskylä', 1, NULL);
        INSERT INTO public.institutions VALUES (408, 'University of Kassel', 1, NULL);
        INSERT INTO public.institutions VALUES (409, 'University of Kentucky', 1, NULL);
        INSERT INTO public.institutions VALUES (410, 'University of L´Aquila', 1, NULL);
        INSERT INTO public.institutions VALUES (411, 'University of Latvia', 1, NULL);
        INSERT INTO public.institutions VALUES (414, 'University of Limerick', 1, NULL);
        INSERT INTO public.institutions VALUES (415, 'University of Manchester', 1, NULL);
        INSERT INTO public.institutions VALUES (416, 'University of Massachusetts Dartmouth', 1, NULL);
        INSERT INTO public.institutions VALUES (417, 'University of Ljubljana', 1, NULL);
        INSERT INTO public.institutions VALUES (418, 'University of Lübeck', 1, NULL);
        INSERT INTO public.institutions VALUES (419, 'University of Melbourne', 1, NULL);
        INSERT INTO public.institutions VALUES (420, 'University of Minho', 1, NULL);
        INSERT INTO public.institutions VALUES (421, 'University of Michigan', 1, NULL);
        INSERT INTO public.institutions VALUES (422, 'University of Nis', 1, NULL);
        INSERT INTO public.institutions VALUES (423, 'University of Natural Resources and Applied Life Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (424, 'University of Nottingham', 1, NULL);
        INSERT INTO public.institutions VALUES (426, 'University of Oulu', 1, NULL);
        INSERT INTO public.institutions VALUES (427, 'University of Oradea', 1, NULL);
        INSERT INTO public.institutions VALUES (428, 'University of Nova Gorica', 1, NULL);
        INSERT INTO public.institutions VALUES (429, 'University of Oslo - Oslo University Hospital', 1, NULL);
        INSERT INTO public.institutions VALUES (430, 'University of Oxford', 1, NULL);
        INSERT INTO public.institutions VALUES (431, 'University of Oviedo', 1, NULL);
        INSERT INTO public.institutions VALUES (432, 'University of Patras', 1, NULL);
        INSERT INTO public.institutions VALUES (433, 'University of Padova', 1, NULL);
        INSERT INTO public.institutions VALUES (434, 'University of Poitiers', 1, NULL);
        INSERT INTO public.institutions VALUES (435, 'University of Potsdam', 1, NULL);
        INSERT INTO public.institutions VALUES (436, 'University of Reading', 1, NULL);
        INSERT INTO public.institutions VALUES (437, 'University of Regensburg', 1, NULL);
        INSERT INTO public.institutions VALUES (438, 'University of Portsmouth', 1, NULL);
        INSERT INTO public.institutions VALUES (439, 'University of Porto', 1, NULL);
        INSERT INTO public.institutions VALUES (440, 'University of Pretoria', 1, NULL);
        INSERT INTO public.institutions VALUES (442, 'University of Rome Tor Vergata', 1, NULL);
        INSERT INTO public.institutions VALUES (443, 'University of Sao Paulo', 1, NULL);
        INSERT INTO public.institutions VALUES (444, 'University of Roskilde', 1, NULL);
        INSERT INTO public.institutions VALUES (445, 'University of Saarland', 1, NULL);
        INSERT INTO public.institutions VALUES (446, 'University of Santiago de Compostela', 1, NULL);
        INSERT INTO public.institutions VALUES (447, 'University of Sassari', 1, NULL);
        INSERT INTO public.institutions VALUES (448, 'University of Saskatchewan', 1, NULL);
        INSERT INTO public.institutions VALUES (449, 'University of Sherbrooke', 1, NULL);
        INSERT INTO public.institutions VALUES (450, 'University of Silesia', 1, NULL);
        INSERT INTO public.institutions VALUES (451, 'University of Science and Technology of China', 1, NULL);
        INSERT INTO public.institutions VALUES (452, 'University of Skövde', 1, NULL);
        INSERT INTO public.institutions VALUES (453, 'University of Science and Technology Beijing', 1, NULL);
        INSERT INTO public.institutions VALUES (454, 'University of Siegen', 1, NULL);
        INSERT INTO public.institutions VALUES (455, 'University of Southampton', 1, NULL);
        INSERT INTO public.institutions VALUES (456, 'University of Southern Denmark', 1, NULL);
        INSERT INTO public.institutions VALUES (457, 'University of St Andrews', 1, NULL);
        INSERT INTO public.institutions VALUES (458, 'University of St. Petersburg', 1, NULL);
        INSERT INTO public.institutions VALUES (459, 'University of Stavanger', 1, NULL);
        INSERT INTO public.institutions VALUES (460, 'University of Thessaly', 1, NULL);
        INSERT INTO public.institutions VALUES (461, 'University of Tartu', 1, NULL);
        INSERT INTO public.institutions VALUES (462, 'University of Toronto', 1, NULL);
        INSERT INTO public.institutions VALUES (463, 'University of Szeged', 1, NULL);
        INSERT INTO public.institutions VALUES (464, 'University of Tromsø', 1, NULL);
        INSERT INTO public.institutions VALUES (465, 'University of Turku', 1, NULL);
        INSERT INTO public.institutions VALUES (466, 'University of Trento', 1, NULL);
        INSERT INTO public.institutions VALUES (467, 'University of Ulster', 1, NULL);
        INSERT INTO public.institutions VALUES (468, 'University of Ulster, Jordanstown campus', 1, NULL);
        INSERT INTO public.institutions VALUES (469, 'University of Verona', 1, NULL);
        INSERT INTO public.institutions VALUES (470, 'University of Vienna', 1, NULL);
        INSERT INTO public.institutions VALUES (471, 'University of Twente', 1, NULL);
        INSERT INTO public.institutions VALUES (472, 'University of Virginia', 1, NULL);
        INSERT INTO public.institutions VALUES (473, 'University of Wisconsin-Madison', 1, NULL);
        INSERT INTO public.institutions VALUES (474, 'University of Wisconsin-Milwaukee', 1, NULL);
        INSERT INTO public.institutions VALUES (475, 'University of Warsaw', 1, NULL);
        INSERT INTO public.institutions VALUES (476, 'University of Warwick', 1, NULL);
        INSERT INTO public.institutions VALUES (477, 'University of Wollongong', 1, NULL);
        INSERT INTO public.institutions VALUES (478, 'University of the Basque Country', 1, NULL);
        INSERT INTO public.institutions VALUES (479, 'University of Zürich', 1, NULL);
        INSERT INTO public.institutions VALUES (480, 'Università degli Studi di Genova', 1, NULL);
        INSERT INTO public.institutions VALUES (481, 'University of the Sunshine Coast', 1, NULL);
        INSERT INTO public.institutions VALUES (482, 'University of York', 1, NULL);
        INSERT INTO public.institutions VALUES (483, 'Universität Augsburg', 1, NULL);
        INSERT INTO public.institutions VALUES (484, 'Universität Göttingen', 1, NULL);
        INSERT INTO public.institutions VALUES (485, 'Universität Hamburg', 1, NULL);
        INSERT INTO public.institutions VALUES (486, 'Universität Heidelberg', 1, NULL);
        INSERT INTO public.institutions VALUES (487, 'Università degli Studi di Trieste', 1, NULL);
        INSERT INTO public.institutions VALUES (488, 'Universität Kiel', 1, NULL);
        INSERT INTO public.institutions VALUES (489, 'Universität Würzburg', 1, NULL);
        INSERT INTO public.institutions VALUES (490, 'Universität Osnabrück', 1, NULL);
        INSERT INTO public.institutions VALUES (491, 'Universität Leipzig', 1, NULL);
        INSERT INTO public.institutions VALUES (492, 'Universität zu Köln', 1, NULL);
        INSERT INTO public.institutions VALUES (493, 'Universität Konstanz', 1, NULL);
        INSERT INTO public.institutions VALUES (494, 'Université de Montpellier', 1, NULL);
        INSERT INTO public.institutions VALUES (496, 'Université Grenoble Alpes', 1, NULL);
        INSERT INTO public.institutions VALUES (497, 'Ural Division of the Russian Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (498, 'Urmia University', 1, NULL);
        INSERT INTO public.institutions VALUES (499, 'Utrecht University', 1, NULL);
        INSERT INTO public.institutions VALUES (500, 'Ural Federal University', 1, NULL);
        INSERT INTO public.institutions VALUES (501, 'Ural State Technical University', 1, NULL);
        INSERT INTO public.institutions VALUES (502, 'VSB-Technical University of Ostrava', 1, NULL);
        INSERT INTO public.institutions VALUES (503, 'Vienna University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (504, 'Vilnius University', 1, NULL);
        INSERT INTO public.institutions VALUES (505, 'Victoria University of Wellington', 1, NULL);
        INSERT INTO public.institutions VALUES (506, 'Voronezh State University', 1, NULL);
        INSERT INTO public.institutions VALUES (508, 'W. Trzebiatowski Institute of Low Temperature and Structure Research, Polish Academy of Sciences', 1, NULL);
        INSERT INTO public.institutions VALUES (509, 'Weill Cornell Medical College, Cornell University', 1, NULL);
        INSERT INTO public.institutions VALUES (510, 'Weizmann Institute of Science', 1, NULL);
        INSERT INTO public.institutions VALUES (511, 'Vinogradov Institute of Geochemistry SB RAS', 1, NULL);
        INSERT INTO public.institutions VALUES (512, 'Wageningen University', 1, NULL);
        INSERT INTO public.institutions VALUES (513, 'Wigner Research Centre for Physics', 1, NULL);
        INSERT INTO public.institutions VALUES (514, 'Wuhan University', 1, NULL);
        INSERT INTO public.institutions VALUES (515, 'Yonsei University', 1, NULL);
        INSERT INTO public.institutions VALUES (516, 'YKI, Institute for Surface Chemistry', 1, NULL);
        INSERT INTO public.institutions VALUES (517, 'Yeditepe University', 1, NULL);
        INSERT INTO public.institutions VALUES (518, 'ZHAW - Zürcher Hochschule für Angewandte Wissenschaften', 1, NULL);
        INSERT INTO public.institutions VALUES (519, 'Zhejiang University', 1, NULL);
        INSERT INTO public.institutions VALUES (520, 'Wroclaw University of Technology', 1, NULL);
        INSERT INTO public.institutions VALUES (521, 'Wihuri Research Institute', 1, NULL);
        INSERT INTO public.institutions VALUES (522, 'Örebro University', 1, NULL);
        INSERT INTO public.institutions VALUES (523, 'Åbo Akademi University', 1, NULL);
        INSERT INTO public.institutions VALUES (125, 'Institut Laue-Langevin (ILL)', 64, 'https://ror.org/01xtjs520');
        INSERT INTO public.institutions VALUES (13, 'Australian Synchrotron', 10, 'https://ror.org/03vk18a84');
        INSERT INTO public.institutions VALUES (155, 'Japan Atomic Energy Research Institute', 91, 'https://ror.org/05nf86y53');
        INSERT INTO public.institutions VALUES (193, 'Lund University', 173, 'https://ror.org/012a77v79');
        INSERT INTO public.institutions VALUES (219, 'Montgomery College', 190, 'https://ror.org/00b7x1x53');
        INSERT INTO public.institutions VALUES (244, 'Oak Ridge National Laboratory', 190, 'https://ror.org/01qz5mb56');
        INSERT INTO public.institutions VALUES (26, 'Brookhaven National Labs', 190, 'https://ror.org/02ex6cf31');
        INSERT INTO public.institutions VALUES (260, 'Royal Institute of Technology (KTH)', 173, 'https://ror.org/026vcq606');
        INSERT INTO public.institutions VALUES (264, 'Rutherford Appleton Laboratory - Central Laser Facility', 1, 'https://ror.org/03gq8fr08');
        INSERT INTO public.institutions VALUES (265, 'ISIS Neutron and Muon Facility', 1, 'https://ror.org/01t8fg661');
        INSERT INTO public.institutions VALUES (289, 'Stockholm University', 173, 'https://ror.org/05f0yaq80');
        INSERT INTO public.institutions VALUES (29, 'CEA - Commissariat à l’énergie atomique', 64, 'https://ror.org/00jjx8s55');
        INSERT INTO public.institutions VALUES (301, 'Tampere University', 63, 'https://ror.org/033003e23');
        INSERT INTO public.institutions VALUES (330, 'Umeå University', 173, 'https://ror.org/05kb8h459');
        INSERT INTO public.institutions VALUES (359, 'University College London', 1, 'https://ror.org/02jx3x895');
        INSERT INTO public.institutions VALUES (363, 'University of Bergen', 135, 'https://ror.org/03zga2b32');
        INSERT INTO public.institutions VALUES (368, 'University of Bologna', 88, 'https://ror.org/01111rn36');
        INSERT INTO public.institutions VALUES (379, 'University of Cape Town', 167, 'https://ror.org/03p74gp79');
        INSERT INTO public.institutions VALUES (383, 'University of Copenhagen', 50, 'https://ror.org/035b05819');
        INSERT INTO public.institutions VALUES (412, 'University of Leeds', 1, 'https://ror.org/024mrxd33');
        INSERT INTO public.institutions VALUES (413, 'University of Leicester', 1, 'https://ror.org/04h699437');
        INSERT INTO public.institutions VALUES (425, 'University of Oslo', 135, 'https://ror.org/01xtthb56');
        INSERT INTO public.institutions VALUES (441, 'University of Rome La Sapienza', 88, 'https://ror.org/02be6w209');
        INSERT INTO public.institutions VALUES (495, 'Uppsala University', 173, 'https://ror.org/048a87296');
        INSERT INTO public.institutions VALUES (5, 'Aarhus University', 50, 'https://ror.org/01aj84f44');
        INSERT INTO public.institutions VALUES (507, 'Vrije Universiteit Brussel', 18, 'https://ror.org/006e5kg04');
        INSERT INTO public.institutions VALUES (7, 'Adam Mickiewicz University', 144, 'https://ror.org/04g6bbq64');
        INSERT INTO public.institutions VALUES (78, 'European Spallation Source ERIC (ESS)', 173, 'https://ror.org/01wv9cn34');
        INSERT INTO public.institutions VALUES (80, 'Forschungszentrum Jülich', 69, 'https://ror.org/02nv7yv05');


















        INSERT INTO public.nationalities VALUES (1, 'Afghan');
        INSERT INTO public.nationalities VALUES (2, 'Albanian');
        INSERT INTO public.nationalities VALUES (3, 'Algerian');
        INSERT INTO public.nationalities VALUES (4, 'American');
        INSERT INTO public.nationalities VALUES (5, 'Andorran');
        INSERT INTO public.nationalities VALUES (6, 'Angolan');
        INSERT INTO public.nationalities VALUES (7, 'Antiguans');
        INSERT INTO public.nationalities VALUES (8, 'Argentinean');
        INSERT INTO public.nationalities VALUES (9, 'Armenian');
        INSERT INTO public.nationalities VALUES (10, 'Australian');
        INSERT INTO public.nationalities VALUES (11, 'Austrian');
        INSERT INTO public.nationalities VALUES (12, 'Azerbaijani');
        INSERT INTO public.nationalities VALUES (13, 'Bahamian');
        INSERT INTO public.nationalities VALUES (14, 'Bahraini');
        INSERT INTO public.nationalities VALUES (15, 'Bangladeshi');
        INSERT INTO public.nationalities VALUES (16, 'Barbadian');
        INSERT INTO public.nationalities VALUES (17, 'Barbudans');
        INSERT INTO public.nationalities VALUES (18, 'Batswana');
        INSERT INTO public.nationalities VALUES (19, 'Belarusian');
        INSERT INTO public.nationalities VALUES (20, 'Belgian');
        INSERT INTO public.nationalities VALUES (21, 'Belizean');
        INSERT INTO public.nationalities VALUES (22, 'Beninese');
        INSERT INTO public.nationalities VALUES (23, 'Bhutanese');
        INSERT INTO public.nationalities VALUES (24, 'Bolivian');
        INSERT INTO public.nationalities VALUES (25, 'Bosnian');
        INSERT INTO public.nationalities VALUES (26, 'Brazilian');
        INSERT INTO public.nationalities VALUES (27, 'British');
        INSERT INTO public.nationalities VALUES (28, 'Bruneian');
        INSERT INTO public.nationalities VALUES (29, 'Bulgarian');
        INSERT INTO public.nationalities VALUES (30, 'Burkinabe');
        INSERT INTO public.nationalities VALUES (31, 'Burmese');
        INSERT INTO public.nationalities VALUES (32, 'Burundian');
        INSERT INTO public.nationalities VALUES (33, 'Cambodian');
        INSERT INTO public.nationalities VALUES (34, 'Cameroonian');
        INSERT INTO public.nationalities VALUES (35, 'Canadian');
        INSERT INTO public.nationalities VALUES (36, 'Cape Verdean');
        INSERT INTO public.nationalities VALUES (37, 'Central African');
        INSERT INTO public.nationalities VALUES (38, 'Chadian');
        INSERT INTO public.nationalities VALUES (39, 'Chilean');
        INSERT INTO public.nationalities VALUES (40, 'Chinese');
        INSERT INTO public.nationalities VALUES (41, 'Colombian');
        INSERT INTO public.nationalities VALUES (42, 'Comoran');
        INSERT INTO public.nationalities VALUES (43, 'Congolese');
        INSERT INTO public.nationalities VALUES (44, 'Costa Rican');
        INSERT INTO public.nationalities VALUES (45, 'Croatian');
        INSERT INTO public.nationalities VALUES (46, 'Cuban');
        INSERT INTO public.nationalities VALUES (47, 'Cypriot');
        INSERT INTO public.nationalities VALUES (48, 'Czech');
        INSERT INTO public.nationalities VALUES (49, 'Danish');
        INSERT INTO public.nationalities VALUES (50, 'Djibouti');
        INSERT INTO public.nationalities VALUES (51, 'Dominican');
        INSERT INTO public.nationalities VALUES (52, 'Dutch');
        INSERT INTO public.nationalities VALUES (53, 'East Timorese');
        INSERT INTO public.nationalities VALUES (54, 'Ecuadorean');
        INSERT INTO public.nationalities VALUES (55, 'Egyptian');
        INSERT INTO public.nationalities VALUES (56, 'Emirian');
        INSERT INTO public.nationalities VALUES (57, 'Equatorial Guinean');
        INSERT INTO public.nationalities VALUES (58, 'Eritrean');
        INSERT INTO public.nationalities VALUES (59, 'Estonian');
        INSERT INTO public.nationalities VALUES (60, 'Ethiopian');
        INSERT INTO public.nationalities VALUES (61, 'Fijian');
        INSERT INTO public.nationalities VALUES (62, 'Filipino');
        INSERT INTO public.nationalities VALUES (63, 'Finnish');
        INSERT INTO public.nationalities VALUES (64, 'French');
        INSERT INTO public.nationalities VALUES (65, 'Gabonese');
        INSERT INTO public.nationalities VALUES (66, 'Gambian');
        INSERT INTO public.nationalities VALUES (67, 'Georgian');
        INSERT INTO public.nationalities VALUES (68, 'German');
        INSERT INTO public.nationalities VALUES (69, 'Ghanaian');
        INSERT INTO public.nationalities VALUES (70, 'Greek');
        INSERT INTO public.nationalities VALUES (71, 'Grenadian');
        INSERT INTO public.nationalities VALUES (72, 'Guatemalan');
        INSERT INTO public.nationalities VALUES (73, 'Guinea-Bissauan');
        INSERT INTO public.nationalities VALUES (74, 'Guinean');
        INSERT INTO public.nationalities VALUES (75, 'Guyanese');
        INSERT INTO public.nationalities VALUES (76, 'Haitian');
        INSERT INTO public.nationalities VALUES (77, 'Herzegovinian');
        INSERT INTO public.nationalities VALUES (78, 'Honduran');
        INSERT INTO public.nationalities VALUES (79, 'Hungarian');
        INSERT INTO public.nationalities VALUES (80, 'Icelander');
        INSERT INTO public.nationalities VALUES (81, 'Indian');
        INSERT INTO public.nationalities VALUES (82, 'Indonesian');
        INSERT INTO public.nationalities VALUES (83, 'Iranian');
        INSERT INTO public.nationalities VALUES (84, 'Iraqi');
        INSERT INTO public.nationalities VALUES (85, 'Irish');
        INSERT INTO public.nationalities VALUES (86, 'Israeli');
        INSERT INTO public.nationalities VALUES (87, 'Italian');
        INSERT INTO public.nationalities VALUES (88, 'Ivorian');
        INSERT INTO public.nationalities VALUES (89, 'Jamaican');
        INSERT INTO public.nationalities VALUES (90, 'Japanese');
        INSERT INTO public.nationalities VALUES (91, 'Jordanian');
        INSERT INTO public.nationalities VALUES (92, 'Kazakhstani');
        INSERT INTO public.nationalities VALUES (93, 'Kenyan');
        INSERT INTO public.nationalities VALUES (94, 'Kittian and Nevisian');
        INSERT INTO public.nationalities VALUES (95, 'Kuwaiti');
        INSERT INTO public.nationalities VALUES (96, 'Kyrgyz');
        INSERT INTO public.nationalities VALUES (97, 'Laotian');
        INSERT INTO public.nationalities VALUES (98, 'Latvian');
        INSERT INTO public.nationalities VALUES (99, 'Lebanese');
        INSERT INTO public.nationalities VALUES (100, 'Liberian');
        INSERT INTO public.nationalities VALUES (101, 'Libyan');
        INSERT INTO public.nationalities VALUES (102, 'Liechtensteiner');
        INSERT INTO public.nationalities VALUES (103, 'Lithuanian');
        INSERT INTO public.nationalities VALUES (104, 'Luxembourger');
        INSERT INTO public.nationalities VALUES (105, 'Macedonian');
        INSERT INTO public.nationalities VALUES (106, 'Malagasy');
        INSERT INTO public.nationalities VALUES (107, 'Malawian');
        INSERT INTO public.nationalities VALUES (108, 'Malaysian');
        INSERT INTO public.nationalities VALUES (109, 'Maldivan');
        INSERT INTO public.nationalities VALUES (110, 'Malian');
        INSERT INTO public.nationalities VALUES (111, 'Maltese');
        INSERT INTO public.nationalities VALUES (112, 'Marshallese');
        INSERT INTO public.nationalities VALUES (113, 'Mauritanian');
        INSERT INTO public.nationalities VALUES (114, 'Mauritian');
        INSERT INTO public.nationalities VALUES (115, 'Mexican');
        INSERT INTO public.nationalities VALUES (116, 'Micronesian');
        INSERT INTO public.nationalities VALUES (117, 'Moldovan');
        INSERT INTO public.nationalities VALUES (118, 'Monacan');
        INSERT INTO public.nationalities VALUES (119, 'Mongolian');
        INSERT INTO public.nationalities VALUES (120, 'Moroccan');
        INSERT INTO public.nationalities VALUES (121, 'Mosotho');
        INSERT INTO public.nationalities VALUES (122, 'Motswana');
        INSERT INTO public.nationalities VALUES (123, 'Mozambican');
        INSERT INTO public.nationalities VALUES (124, 'Namibian');
        INSERT INTO public.nationalities VALUES (125, 'Nauruan');
        INSERT INTO public.nationalities VALUES (126, 'Nepalese');
        INSERT INTO public.nationalities VALUES (127, 'New Zealander');
        INSERT INTO public.nationalities VALUES (128, 'Ni-Vanuatu');
        INSERT INTO public.nationalities VALUES (129, 'Nicaraguan');
        INSERT INTO public.nationalities VALUES (130, 'Nigerien');
        INSERT INTO public.nationalities VALUES (131, 'North Korean');
        INSERT INTO public.nationalities VALUES (132, 'Northern Irish');
        INSERT INTO public.nationalities VALUES (133, 'Norwegian');
        INSERT INTO public.nationalities VALUES (134, 'Omani');
        INSERT INTO public.nationalities VALUES (135, 'Pakistani');
        INSERT INTO public.nationalities VALUES (136, 'Palauan');
        INSERT INTO public.nationalities VALUES (137, 'Panamanian');
        INSERT INTO public.nationalities VALUES (138, 'Papua New Guinean');
        INSERT INTO public.nationalities VALUES (139, 'Paraguayan');
        INSERT INTO public.nationalities VALUES (140, 'Peruvian');
        INSERT INTO public.nationalities VALUES (141, 'Polish');
        INSERT INTO public.nationalities VALUES (142, 'Portuguese');
        INSERT INTO public.nationalities VALUES (143, 'Qatari');
        INSERT INTO public.nationalities VALUES (144, 'Romanian');
        INSERT INTO public.nationalities VALUES (145, 'Russian');
        INSERT INTO public.nationalities VALUES (146, 'Rwandan');
        INSERT INTO public.nationalities VALUES (147, 'Saint Lucian');
        INSERT INTO public.nationalities VALUES (148, 'Salvadoran');
        INSERT INTO public.nationalities VALUES (149, 'Samoan');
        INSERT INTO public.nationalities VALUES (150, 'San Marinese');
        INSERT INTO public.nationalities VALUES (151, 'Sao Tomean');
        INSERT INTO public.nationalities VALUES (152, 'Saudi');
        INSERT INTO public.nationalities VALUES (153, 'Senegalese');
        INSERT INTO public.nationalities VALUES (154, 'Serbian');
        INSERT INTO public.nationalities VALUES (155, 'Seychellois');
        INSERT INTO public.nationalities VALUES (156, 'Sierra Leonean');
        INSERT INTO public.nationalities VALUES (157, 'Singaporean');
        INSERT INTO public.nationalities VALUES (158, 'Slovakian');
        INSERT INTO public.nationalities VALUES (159, 'Slovenian');
        INSERT INTO public.nationalities VALUES (160, 'Solomon Islander');
        INSERT INTO public.nationalities VALUES (161, 'Somali');
        INSERT INTO public.nationalities VALUES (162, 'South African');
        INSERT INTO public.nationalities VALUES (163, 'South Korean');
        INSERT INTO public.nationalities VALUES (164, 'Spanish');
        INSERT INTO public.nationalities VALUES (165, 'Sri Lankan');
        INSERT INTO public.nationalities VALUES (166, 'Sudanese');
        INSERT INTO public.nationalities VALUES (167, 'Surinamer');
        INSERT INTO public.nationalities VALUES (168, 'Swazi');
        INSERT INTO public.nationalities VALUES (169, 'Swedish');
        INSERT INTO public.nationalities VALUES (170, 'Swiss');
        INSERT INTO public.nationalities VALUES (171, 'Syrian');
        INSERT INTO public.nationalities VALUES (172, 'Taiwanese');
        INSERT INTO public.nationalities VALUES (173, 'Tajik');
        INSERT INTO public.nationalities VALUES (174, 'Tanzanian');
        INSERT INTO public.nationalities VALUES (175, 'Thai');
        INSERT INTO public.nationalities VALUES (176, 'Togolese');
        INSERT INTO public.nationalities VALUES (177, 'Tongan');
        INSERT INTO public.nationalities VALUES (178, 'Trinidadian or Tobagonian');
        INSERT INTO public.nationalities VALUES (179, 'Tunisian');
        INSERT INTO public.nationalities VALUES (180, 'Turkish');
        INSERT INTO public.nationalities VALUES (181, 'Tuvaluan');
        INSERT INTO public.nationalities VALUES (182, 'Ugandan');
        INSERT INTO public.nationalities VALUES (183, 'Ukrainian');
        INSERT INTO public.nationalities VALUES (184, 'Uruguayan');
        INSERT INTO public.nationalities VALUES (185, 'Uzbekistani');
        INSERT INTO public.nationalities VALUES (186, 'Venezuelan');
        INSERT INTO public.nationalities VALUES (187, 'Vietnamese');
        INSERT INTO public.nationalities VALUES (188, 'Yemenite');
        INSERT INTO public.nationalities VALUES (189, 'Zambian');
        INSERT INTO public.nationalities VALUES (190, 'Zimbabwean');






        INSERT INTO public.pagetext VALUES (1, 'HOMEPAGE');
        INSERT INTO public.pagetext VALUES (2, 'HELPPAGE');
        INSERT INTO public.pagetext VALUES (3, 'PRIVACYPAGE');
        INSERT INTO public.pagetext VALUES (4, 'COOKIEPAGE');
        INSERT INTO public.pagetext VALUES (5, 'REVIEWPAGE');
        INSERT INTO public.pagetext VALUES (6, '');












        INSERT INTO public.proposal_status_actions VALUES (1, 'Email action', 'This is an action for email sending. It can be configured to use different recipients and email templates.', 'EMAIL');
        INSERT INTO public.proposal_status_actions VALUES (2, 'RabbitMQ action', 'This is an action for sending messages to a specific exchange. It can be configured to use different exchange name recipients and data.', 'RABBITMQ');



        INSERT INTO public.proposal_statuses VALUES (1, 'DRAFT', 'When proposal is created it gets draft status before it is submitted.', true, 'DRAFT');
        INSERT INTO public.proposal_statuses VALUES (2, 'FEASIBILITY_REVIEW', 'Status that indicates that proposal feasibility review should be done.', true, 'FEASIBILITY_REVIEW');
        INSERT INTO public.proposal_statuses VALUES (3, 'NOT_FEASIBLE', 'Status that indicates that proposal is not feasible.', true, 'NOT_FEASIBLE');
        INSERT INTO public.proposal_statuses VALUES (6, 'ALLOCATED', 'Proposal time allocation should be done.', true, 'ALLOCATED');
        INSERT INTO public.proposal_statuses VALUES (7, 'NOT_ALLOCATED', 'Proposal is not allocated.', true, 'NOT_ALLOCATED');
        INSERT INTO public.proposal_statuses VALUES (8, 'SCHEDULING', 'Proposal should be scheduled.', true, 'SCHEDULING');
        INSERT INTO public.proposal_statuses VALUES (9, 'EXPIRED', 'Proposal has expired.', true, 'EXPIRED');
        INSERT INTO public.proposal_statuses VALUES (10, 'Feasibility and sample review', 'Status that indicates that proposal feasibility and sample review can be done in the same time.', true, 'FEASIBILITY_AND_SAMPLE_REVIEW');
        INSERT INTO public.proposal_statuses VALUES (11, 'Sample review', 'Status that indicates that proposal sample review can be done.', true, 'SAMPLE_REVIEW');
        INSERT INTO public.proposal_statuses VALUES (13, 'Management decision', 'Proposal is ready for management decision.', true, 'MANAGEMENT_DECISION');
        INSERT INTO public.proposal_statuses VALUES (14, 'EDITABLE_SUBMITTED', 'Proposal is editable after submission.', false, 'EDITABLE_SUBMITTED');
        INSERT INTO public.proposal_statuses VALUES (15, 'EDITABLE_SUBMITTED_INTERNAL', 'Proposal is editable after submission by internal users only.', false, 'EDITABLE_SUBMITTED_INTERNAL');
        INSERT INTO public.proposal_statuses VALUES (4, 'FAP_SELECTION', 'Status that indicates that proposal is ready to be assigned to FAP.', true, 'FAP_SELECTION');
        INSERT INTO public.proposal_statuses VALUES (5, 'FAP_REVIEW', 'Proposal FAP review should be done.', true, 'FAP_REVIEW');
        INSERT INTO public.proposal_statuses VALUES (12, 'FAP Meeting', 'Proposal is ready for FAP meeting ranking.', true, 'FAP_MEETING');
        INSERT INTO public.proposal_statuses VALUES (16, 'FAP_AND_FEASIBILITY_REVIEW', 'Status that indicates that proposal feasibility review and Fap Review should be done.', true, 'FAP_AND_FEASIBILITY_REVIEW');









        INSERT INTO public.proposal_workflow_connections VALUES (1, 1, 1, NULL, NULL, 0, 'proposalWorkflowConnections_0', NULL);



        INSERT INTO public.proposal_workflows VALUES (1, 'Default workflow', 'This is the default workflow');






        INSERT INTO public.quantities VALUES ('length');
        INSERT INTO public.quantities VALUES ('mass');
        INSERT INTO public.quantities VALUES ('time');
        INSERT INTO public.quantities VALUES ('electric current');
        INSERT INTO public.quantities VALUES ('thermodynamic temperature');
        INSERT INTO public.quantities VALUES ('amount of substance');
        INSERT INTO public.quantities VALUES ('luminous intensity');
        INSERT INTO public.quantities VALUES ('area');
        INSERT INTO public.quantities VALUES ('volume');
        INSERT INTO public.quantities VALUES ('speed, velocity');
        INSERT INTO public.quantities VALUES ('acceleration');
        INSERT INTO public.quantities VALUES ('mass density');
        INSERT INTO public.quantities VALUES ('magnetic field strength');
        INSERT INTO public.quantities VALUES ('concentration');
        INSERT INTO public.quantities VALUES ('luminance');
        INSERT INTO public.quantities VALUES ('angle');
        INSERT INTO public.quantities VALUES ('frequency');
        INSERT INTO public.quantities VALUES ('force');
        INSERT INTO public.quantities VALUES ('pressure, stress');
        INSERT INTO public.quantities VALUES ('energy, work, quantity of heat');
        INSERT INTO public.quantities VALUES ('power radiant flux');
        INSERT INTO public.quantities VALUES ('electric charge, quantity of electricity');
        INSERT INTO public.quantities VALUES ('electromotive force');
        INSERT INTO public.quantities VALUES ('capacitance');
        INSERT INTO public.quantities VALUES ('electric resistance');
        INSERT INTO public.quantities VALUES ('electric conductance');
        INSERT INTO public.quantities VALUES ('magnetic flux');
        INSERT INTO public.quantities VALUES ('magnetic flux density');
        INSERT INTO public.quantities VALUES ('inductance');
        INSERT INTO public.quantities VALUES ('luminous flux');
        INSERT INTO public.quantities VALUES ('illuminance');
        INSERT INTO public.quantities VALUES ('surface tension');
        INSERT INTO public.quantities VALUES ('angular velocity');
        INSERT INTO public.quantities VALUES ('angular acceleration');
        INSERT INTO public.quantities VALUES ('heat flux density, irradiance');
        INSERT INTO public.quantities VALUES ('heat capacity, entropy');
        INSERT INTO public.quantities VALUES ('specific energy');
        INSERT INTO public.quantities VALUES ('thermal conductivity');
        INSERT INTO public.quantities VALUES ('energy density');
        INSERT INTO public.quantities VALUES ('electric field strength');
        INSERT INTO public.quantities VALUES ('electric charge density');
        INSERT INTO public.quantities VALUES ('electric flux density');
        INSERT INTO public.quantities VALUES ('permittivity');
        INSERT INTO public.quantities VALUES ('permeability');
        INSERT INTO public.quantities VALUES ('molar energy');
        INSERT INTO public.quantities VALUES ('molar entropy, molar heat capacity');
        INSERT INTO public.quantities VALUES ('exposure (x and gamma rays)');
        INSERT INTO public.quantities VALUES ('absorbed dose rate');
        INSERT INTO public.quantities VALUES ('radiant intensity');
        INSERT INTO public.quantities VALUES ('radiance');
        INSERT INTO public.quantities VALUES ('dose equivalent');
        INSERT INTO public.quantities VALUES ('activity (of a radionuclide)');
        INSERT INTO public.quantities VALUES ('absorbed dose, specific energy (imparted), kerma');
        INSERT INTO public.quantities VALUES ('catalytic (activity) concentration');



        INSERT INTO public.question_datatypes VALUES ('TEXT_INPUT');
        INSERT INTO public.question_datatypes VALUES ('SELECTION_FROM_OPTIONS');
        INSERT INTO public.question_datatypes VALUES ('BOOLEAN');
        INSERT INTO public.question_datatypes VALUES ('DATE');
        INSERT INTO public.question_datatypes VALUES ('FILE_UPLOAD');
        INSERT INTO public.question_datatypes VALUES ('EMBELLISHMENT');
        INSERT INTO public.question_datatypes VALUES ('SAMPLE_BASIS');
        INSERT INTO public.question_datatypes VALUES ('PROPOSAL_BASIS');
        INSERT INTO public.question_datatypes VALUES ('SAMPLE_DECLARATION');
        INSERT INTO public.question_datatypes VALUES ('INTERVAL');
        INSERT INTO public.question_datatypes VALUES ('NUMBER_INPUT');
        INSERT INTO public.question_datatypes VALUES ('SHIPMENT_BASIS');
        INSERT INTO public.question_datatypes VALUES ('RICH_TEXT_INPUT');
        INSERT INTO public.question_datatypes VALUES ('VISIT_BASIS');
        INSERT INTO public.question_datatypes VALUES ('PROPOSAL_ESI_BASIS');
        INSERT INTO public.question_datatypes VALUES ('SAMPLE_ESI_BASIS');
        INSERT INTO public.question_datatypes VALUES ('GENERIC_TEMPLATE');
        INSERT INTO public.question_datatypes VALUES ('GENERIC_TEMPLATE_BASIS');
        INSERT INTO public.question_datatypes VALUES ('FEEDBACK_BASIS');
        INSERT INTO public.question_datatypes VALUES ('DYNAMIC_MULTIPLE_CHOICE');
        INSERT INTO public.question_datatypes VALUES ('INSTRUMENT_PICKER');
        INSERT INTO public.question_datatypes VALUES ('FAP_REVIEW_BASIS');






        INSERT INTO public.questionaries VALUES (1, 2, '2025-02-11 12:07:04.663875+00', 0);



        INSERT INTO public.questions VALUES ('sample_basis', 'SAMPLE_BASIS', 'Sample basic information', '{"tooltip": "", "required": false, "small_label": "", "titlePlaceholder": "Title"}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'sample_basis', 2);
        INSERT INTO public.questions VALUES ('proposal_basis', 'PROPOSAL_BASIS', 'Proposal basic information', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'proposal_basis', 1);
        INSERT INTO public.questions VALUES ('shipment_basis', 'SHIPMENT_BASIS', 'Shipment basic information', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'shipment_basis', 3);
        INSERT INTO public.questions VALUES ('visit_basis', 'VISIT_BASIS', 'Visit basic information', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'visitat_basis', 4);
        INSERT INTO public.questions VALUES ('sample_esi_basis', 'SAMPLE_ESI_BASIS', 'Sample ESI basic information', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'sample_esi_basis', 2);
        INSERT INTO public.questions VALUES ('proposal_esi_basis', 'PROPOSAL_ESI_BASIS', 'Proposal ESI basis', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'proposal_esi_basis', 1);
        INSERT INTO public.questions VALUES ('generic_template_basis', 'GENERIC_TEMPLATE_BASIS', 'Template basic information', '{"tooltip": "", "required": false, "small_label": "", "questionLabel": "", "titlePlaceholder": "Title"}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'generic_template_basis', 7);
        INSERT INTO public.questions VALUES ('feedback_basis', 'FEEDBACK_BASIS', 'Feedback basic information', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'feedback_basis', 8);
        INSERT INTO public.questions VALUES ('fap_review_basis', 'FAP_REVIEW_BASIS', 'FAP review basic information', '{"tooltip": "", "required": false, "small_label": ""}', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 'fap_review_basis', 10);









        INSERT INTO public.role_user VALUES (2, 0, 1);
        INSERT INTO public.role_user VALUES (1, 1, 2);
        INSERT INTO public.role_user VALUES (2, 2, 3);
        INSERT INTO public.role_user VALUES (1, 4, 5);
        INSERT INTO public.role_user VALUES (1, 5, 6);
        INSERT INTO public.role_user VALUES (1, 6, 7);
        INSERT INTO public.role_user VALUES (6, 3, 4);



        INSERT INTO public.roles VALUES (1, 'user', 'User');
        INSERT INTO public.roles VALUES (2, 'user_officer', 'User Officer');
        INSERT INTO public.roles VALUES (7, 'instrument_scientist', 'Instrument Scientist');
        INSERT INTO public.roles VALUES (8, 'sample_safety_reviewer', 'Sample safety reviewer');
        INSERT INTO public.roles VALUES (9, 'internal_reviewer', 'Internal reviewer');
        INSERT INTO public.roles VALUES (4, 'fap_chair', 'FAP Chair');
        INSERT INTO public.roles VALUES (5, 'fap_secretary', 'FAP Secretary');
        INSERT INTO public.roles VALUES (6, 'fap_reviewer', 'FAP Reviewer');












        INSERT INTO public.settings VALUES ('PROFILE_PAGE_LINK', NULL, 'Link to external user profile');
        INSERT INTO public.settings VALUES ('IDLE_TIMEOUT', NULL, 'Timeout for Idle timer in milliseconds');
        INSERT INTO public.settings VALUES ('USER_OFFICE_EMAIL', NULL, 'Email address for the user office. E.g. ''useroffice1@email.com; useroffice2@email.com''');
        INSERT INTO public.settings VALUES ('SMTP_BCC_EMAIL', NULL, 'Email address for setting bcc recipient for SMTP mails. E.g. ''bcc1@email.com; bcc2@email.com''');
        INSERT INTO public.settings VALUES ('TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS', NULL, 'Workflow status that if included a technical review will be created. Leave empty for all proposals to get tech reviews');
        INSERT INTO public.settings VALUES ('EXTERNAL_AUTH_LOGOUT_URL', 'http://localhost:5000/session/end?client_id=useroffice', 'URL which terminates the external auth session');
        INSERT INTO public.settings VALUES ('PALETTE_PRIMARY_DARK', '#519548', 'Hex value for primary dark colour');
        INSERT INTO public.settings VALUES ('PALETTE_PRIMARY_MAIN', '#519548', 'Hex value for primary main colour');
        INSERT INTO public.settings VALUES ('PALETTE_PRIMARY_LIGHT', '#BEF202', 'Hex value for primary light colour');
        INSERT INTO public.settings VALUES ('PALETTE_PRIMARY_ACCENT', '#000000', 'Hex value for primary main colour');
        INSERT INTO public.settings VALUES ('PALETTE_PRIMARY_CONTRAST', '#ffffff', 'Hex value for primary contrast text colour');
        INSERT INTO public.settings VALUES ('PALETTE_SECONDARY_DARK', '#1B676B', 'Hex value for secondary dark colour');
        INSERT INTO public.settings VALUES ('PALETTE_SECONDARY_MAIN', '#1B676B', 'Hex value for secondary main colour');
        INSERT INTO public.settings VALUES ('PALETTE_SECONDARY_LIGHT', '#1B676B', 'Hex value for secondary light colour');
        INSERT INTO public.settings VALUES ('PALETTE_SECONDARY_CONTRAST', '#ffffff', 'Hex value for secondary contrast text colour');
        INSERT INTO public.settings VALUES ('PALETTE_ERROR_MAIN', '#f44336', 'Hex value for error main colour');
        INSERT INTO public.settings VALUES ('PALETTE_SUCCESS_MAIN', '#4caf50', 'Hex value for success main colour');
        INSERT INTO public.settings VALUES ('PALETTE_WARNING_MAIN', '#ff9800', 'Hex value for warning main colour');
        INSERT INTO public.settings VALUES ('PALETTE_INFO_MAIN', '#2196f3', 'Hex value for info main colour');
        INSERT INTO public.settings VALUES ('HEADER_LOGO_FILENAME', 'ess-white.svg', 'The filename of the image to use in the header. E.g. stfc-ukri-white.svg');
        INSERT INTO public.settings VALUES ('DEFAULT_INST_SCI_REVIEWER_FILTER', 'ME', 'Default instrument scientist reviewer filter');
        INSERT INTO public.settings VALUES ('DEFAULT_INST_SCI_STATUS_FILTER', 'FEASIBILITY_REVIEW', 'Default instrument scientist status filter');
        INSERT INTO public.settings VALUES ('GRADE_PRECISION', '1', 'What the increment of the grade number should be');
        INSERT INTO public.settings VALUES ('TIMEZONE', 'Europe/Stockholm', 'IANA time zone name, used for call start/end times');
        INSERT INTO public.settings VALUES ('DATE_FORMAT', 'dd-MM-yyyy', 'Format used to represent date without times');
        INSERT INTO public.settings VALUES ('DATE_TIME_FORMAT', 'dd-MM-yyyy HH:mm', 'Format used to represent date with time without seconds.');
        INSERT INTO public.settings VALUES ('EXTERNAL_AUTH_LOGIN_URL', 'http://localhost:5000/auth?client_id=useroffice&scope=openid%20profile%20email&response_type=code', 'P&O Login URL');
























        INSERT INTO public.template_categories VALUES (1, 'Proposal');
        INSERT INTO public.template_categories VALUES (2, 'Sample declaration');
        INSERT INTO public.template_categories VALUES (3, 'Shipment declaration');
        INSERT INTO public.template_categories VALUES (4, 'Visit');
        INSERT INTO public.template_categories VALUES (7, 'Generic template');
        INSERT INTO public.template_categories VALUES (8, 'Feedback');
        INSERT INTO public.template_categories VALUES (9, 'PDF template');
        INSERT INTO public.template_categories VALUES (10, 'FAP Review');



        INSERT INTO public.template_groups VALUES ('PROPOSAL', 1);
        INSERT INTO public.template_groups VALUES ('PROPOSAL_ESI', 1);
        INSERT INTO public.template_groups VALUES ('SAMPLE', 2);
        INSERT INTO public.template_groups VALUES ('SAMPLE_ESI', 2);
        INSERT INTO public.template_groups VALUES ('SHIPMENT', 3);
        INSERT INTO public.template_groups VALUES ('VISIT_REGISTRATION', 4);
        INSERT INTO public.template_groups VALUES ('GENERIC_TEMPLATE', 7);
        INSERT INTO public.template_groups VALUES ('FEEDBACK', 8);
        INSERT INTO public.template_groups VALUES ('PDF_TEMPLATE', 9);
        INSERT INTO public.template_groups VALUES ('FAP_REVIEW_TEMPLATE', 10);



        INSERT INTO public.templates VALUES (1, 'default template', 'original template', false, 'PROPOSAL');
        INSERT INTO public.templates VALUES (2, 'default fap review template', 'default fap review template', false, 'FAP_REVIEW_TEMPLATE');



        INSERT INTO public.templates_has_questions VALUES ('proposal_basis', 1, 1, 0, '{"tooltip": "", "required": false, "small_label": ""}', 'AND');
        INSERT INTO public.templates_has_questions VALUES ('fap_review_basis', 2, 2, 0, '{"tooltip": "", "required": false, "small_label": ""}', 'AND');






        INSERT INTO public.topics VALUES (1, 'New proposal', true, 0, 1);
        INSERT INTO public.topics VALUES (2, 'New fap review', true, 0, 2);



        INSERT INTO public.units VALUES ('kelvin', 'kelvin', 'mass', '', 'x');
        INSERT INTO public.units VALUES ('celsius', 'celsius', 'mass', '', 'x');
        INSERT INTO public.units VALUES ('length', 'meter', 'length', 'm', 'x');
        INSERT INTO public.units VALUES ('mass', 'kilogram', 'mass', 'kg', 'x');
        INSERT INTO public.units VALUES ('time', 'second', 'time', 's', 'x');
        INSERT INTO public.units VALUES ('electric_current', 'ampere', 'electric current', 'A', 'x');
        INSERT INTO public.units VALUES ('temperature', 'kelvin', 'thermodynamic temperature', 'K', 'x');
        INSERT INTO public.units VALUES ('amount_of_substance', 'mole', 'amount of substance', 'mol', 'x');
        INSERT INTO public.units VALUES ('luminous_intensity', 'candela', 'luminous intensity', 'cd', 'x');
        INSERT INTO public.units VALUES ('area', 'square meter', 'area', 'm2', 'x');
        INSERT INTO public.units VALUES ('volume', 'cubic meter', 'volume', 'm3', 'x');
        INSERT INTO public.units VALUES ('speed', 'meter per second', 'speed, velocity', 'm/s', 'x');
        INSERT INTO public.units VALUES ('acceleration', 'meter per second squared', 'acceleration', 'm/s2', 'x');
        INSERT INTO public.units VALUES ('mass_density', 'kilogram per cubic meter', 'mass density', 'kg/m3', 'x');
        INSERT INTO public.units VALUES ('magnetic_field_strength', 'ampere per meter', 'magnetic field strength', 'A/m', 'x');
        INSERT INTO public.units VALUES ('concentration', 'mole per cubic meter', 'concentration', 'mol/m3', 'x');
        INSERT INTO public.units VALUES ('luminance', 'candela per square meter', 'luminance', 'cd/m2', 'x');
        INSERT INTO public.units VALUES ('angle', 'radian (a)', 'angle', 'rad', 'x');
        INSERT INTO public.units VALUES ('frequency', 'hertz', 'frequency', 'Hz', 'x');
        INSERT INTO public.units VALUES ('force', 'newton', 'force', 'N', 'x');
        INSERT INTO public.units VALUES ('pressure', 'pascal', 'pressure, stress', 'Pa', 'x');
        INSERT INTO public.units VALUES ('energy', 'joule', 'energy, work, quantity of heat', 'J', 'x');
        INSERT INTO public.units VALUES ('power', 'watt', 'power radiant flux', 'W', 'x');
        INSERT INTO public.units VALUES ('electricity_quantity', 'coulomb', 'electric charge, quantity of electricity', 'C', 'x');
        INSERT INTO public.units VALUES ('electromotive_force', 'volt', 'electromotive force', 'V', 'x');
        INSERT INTO public.units VALUES ('capacitance', 'farad', 'capacitance', 'F', 'x');
        INSERT INTO public.units VALUES ('electric_resistance', 'ohm', 'electric resistance', 'Ω', 'x');
        INSERT INTO public.units VALUES ('electric_conductance', 'siemens', 'electric conductance', 'S', 'x');
        INSERT INTO public.units VALUES ('magnetic_flux', 'weber', 'magnetic flux', 'Wb', 'x');
        INSERT INTO public.units VALUES ('magnetic_flux_density', 'tesla', 'magnetic flux density', 'T', 'x');
        INSERT INTO public.units VALUES ('inductance', 'henry', 'inductance', 'H', 'x');
        INSERT INTO public.units VALUES ('luminous_flux', 'lumen', 'luminous flux', 'lm', 'x');
        INSERT INTO public.units VALUES ('illuminance', 'lux', 'illuminance', 'lx', 'x');
        INSERT INTO public.units VALUES ('surface_tension', 'newton per meter', 'surface tension', 'N/m', 'x');
        INSERT INTO public.units VALUES ('angular_velocity', 'radian per second', 'angular velocity', 'rad/s', 'x');
        INSERT INTO public.units VALUES ('angular_acceleration', 'radian per second squared', 'angular acceleration', 'rad/s2', 'x');
        INSERT INTO public.units VALUES ('irradiance', 'watt per square meter', 'heat flux density, irradiance', 'W/m2', 'x');
        INSERT INTO public.units VALUES ('heat_capacity', 'joule per kelvin', 'heat capacity, entropy', 'J/K', 'x');
        INSERT INTO public.units VALUES ('specific_energy', 'joule per kilogram', 'specific energy', 'J/kg', 'x');
        INSERT INTO public.units VALUES ('thermal_conductivity', 'watt per meter kelvin', 'thermal conductivity', 'W/(m·K)', 'x');
        INSERT INTO public.units VALUES ('energy_density', 'joule per cubic meter', 'energy density', 'J/m3', 'x');
        INSERT INTO public.units VALUES ('electric_field_strength', 'volt per meter', 'electric field strength', 'V/m', 'x');
        INSERT INTO public.units VALUES ('elecelectric_charge_densitytric', 'coulomb per cubic meter', 'electric charge density', 'C/m3', 'x');
        INSERT INTO public.units VALUES ('electric_flux_density', 'coulomb per square meter', 'electric flux density', 'C/m2', 'x');
        INSERT INTO public.units VALUES ('permittivity', 'farad per meter', 'permittivity', 'F/m', 'x');
        INSERT INTO public.units VALUES ('permeability', 'henry per meter', 'permeability', 'H/m', 'x');
        INSERT INTO public.units VALUES ('molar_energy', 'joule per mole', 'molar energy', 'J/mol', 'x');
        INSERT INTO public.units VALUES ('molar_entropy', 'joule per mole kelvin', 'molar entropy, molar heat capacity', 'J/(mol·K)', 'x');
        INSERT INTO public.units VALUES ('exposure', 'coulomb per kilogram', 'exposure (x and gamma rays)', 'C/kg', 'x');
        INSERT INTO public.units VALUES ('absorbed_dose_rate', 'gray per second', 'absorbed dose rate', 'Gy/s', 'x');
        INSERT INTO public.units VALUES ('radiant_intensity', 'watt per steradian', 'radiant intensity', 'W/sr', 'x');
        INSERT INTO public.units VALUES ('radiance', 'watt per square meter steradian', 'radiance', 'W/(m2·sr)', 'x');
        INSERT INTO public.units VALUES ('sievert', 'sievert', 'dose equivalent', 'Sv', 'x');
        INSERT INTO public.units VALUES ('becquerel', 'becquerel', 'activity (of a radionuclide)', 'Bq', 'x');
        INSERT INTO public.units VALUES ('gray', 'gray', 'absorbed dose, specific energy (imparted), kerma', 'Gy', 'x');
        INSERT INTO public.units VALUES ('catalytic_concentration', 'katal per cubic meter', 'catalytic (activity) concentration', 'kat/m3', 'x');



        INSERT INTO public.users VALUES (0, 'Mr.', '', 'Service account', '', 'service', 'Service account', '', '', 'male', '2000-04-02', '', '', 'service@useroffice.ess.eu', '', '', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, false, NULL);
        INSERT INTO public.users VALUES (1, 'Mr.', 'Christian', 'Carl', 'Carlsson', 'testuser', 'Carl', 'Javon4.oauthsub', 'dummy-refresh-token', 'male', '2000-04-02', 'IT deparment', 'Strategist', 'Javon4@hotmail.com', '(288) 431-1443', '(370) 386-8976', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, false, 'dummy-issuer');
        INSERT INTO public.users VALUES (2, 'Mr.', 'Adam', 'Anders', 'Andersson', 'testofficer', 'Alexander', 'Aaron_Harris49.oauthsub', 'dummy-refresh-token', 'male', '1981-08-05', 'IT department', 'Liaison', 'Aaron_Harris49@gmail.com', '711-316-5728', '1-359-864-3489 x7390', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, false, 'dummy-issuer');
        INSERT INTO public.users VALUES (3, 'Mr.', 'Noah', 'Nils', 'Nilsson', 'testreviewer', 'Nicolas', 'nils.oauthsub', 'dummy-refresh-token', 'male', '1981-08-05', 'IT department', 'Liaison', 'nils@ess.se', '711-316-5728', '1-359-864-3489 x7390', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, false, 'dummy-issuer');
        INSERT INTO public.users VALUES (4, 'Mr.', 'Bryson', 'Benjamin', 'Beckley', 'testuser2', 'Benjamin', 'ben.oauthsub', 'dummy-refresh-token', 'male', '2000-04-02', 'IT deparment', 'Management', 'ben@inbox.com', '(288) 221-4533', '(370) 555-4432', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, false, 'dummy-issuer');
        INSERT INTO public.users VALUES (6, 'Mr.', 'David', 'David', 'Dawson', 'testuser4', 'David', 'david.oauthsub', 'dummy-refresh-token', 'male', '1995-04-01', 'Maxillofacial surgeon', 'Management', 'david@teleworm.us', '0676 472 14 66', '0676 159 94 87', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, false, 'dummy-issuer');
        INSERT INTO public.users VALUES (5, 'Mr.', '', 'Unverified email', 'Placeholder', 'testuser3', '', NULL, NULL, 'male', '2000-04-02', 'IT deparment', 'Management', 'unverified-user@example.com', '(288) 221-4533', '(370) 555-4432', '2025-02-11 12:07:04.663875+00', '2025-02-11 12:07:04.663875+00', 1, 1, true, NULL);









        PERFORM pg_catalog.setval('public.call_call_id_seq', 1, true);



        PERFORM pg_catalog.setval('public.countries_country_id_seq', 199, true);



        PERFORM pg_catalog.setval('public.event_logs_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.experiment_safety_inputs_esi_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.fap_proposals_fap_proposal_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.faps_fap_id_seq', 1, true);



        PERFORM pg_catalog.setval('public.feedback_requests_feedback_request_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.feedbacks_feedback_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.files_file_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.generic_templates_generic_template_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.institutions_institution_id_seq', 523, true);



        PERFORM pg_catalog.setval('public.instrument_has_proposals_instrument_has_proposals_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.instruments_instrument_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.internal_reviews_internal_review_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.nationalities_nationality_id_seq', 190, true);



        PERFORM pg_catalog.setval('public.next_status_events_next_status_event_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.pagetext_pagetext_id_seq', 5, true);



        PERFORM pg_catalog.setval('public.pdf_templates_pdf_template_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.predefined_messages_predefined_message_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.proposal_answers_answer_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.proposal_status_actions_proposal_status_action_id_seq', 2, true);



        PERFORM pg_catalog.setval('public.proposal_statuses_proposal_status_id_seq', 16, true);



        PERFORM pg_catalog.setval('public.proposal_templates_template_id_seq', 2, true);



        PERFORM pg_catalog.setval('public.proposal_topics_sort_order_seq', 1, false);



        PERFORM pg_catalog.setval('public.proposal_topics_topic_id_seq', 2, true);



        PERFORM pg_catalog.setval('public.proposal_workflow_connections_proposal_workflow_connection__seq', 1, true);



        PERFORM pg_catalog.setval('public.proposal_workflows_proposal_workflow_id_seq', 1, true);



        PERFORM pg_catalog.setval('public.proposals_proposal_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.proposals_short_code_seq', 1, false);



        PERFORM pg_catalog.setval('public.question_dependencies_question_dependency_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.questionaries_questionary_id_seq', 1, true);



        PERFORM pg_catalog.setval('public.reviews_review_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.role_user_role_user_id_seq', 7, true);



        PERFORM pg_catalog.setval('public.roles_role_id_seq', 9, true);



        PERFORM pg_catalog.setval('public.samples_sample_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.shipments_shipment_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.technical_review_technical_review_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.techniques_technique_id_seq', 1, false);



        PERFORM pg_catalog.setval('public.template_categories_template_category_id_seq', 6, true);



        PERFORM pg_catalog.setval('public.users_user_id_seq', 6, true);



        PERFORM pg_catalog.setval('public.visitations_visitation_id_seq', 1, false);



        ALTER TABLE ONLY public.active_templates
            ADD CONSTRAINT active_templates_group_id_key UNIQUE (group_id);



        ALTER TABLE ONLY public.answers
            ADD CONSTRAINT answers_answer_id_key UNIQUE (answer_id);



        ALTER TABLE ONLY public.answers
            ADD CONSTRAINT answers_pkey PRIMARY KEY (questionary_id, question_id);



        ALTER TABLE ONLY public.api_permissions
            ADD CONSTRAINT api_permissions_pkey PRIMARY KEY (access_token_id);



        ALTER TABLE ONLY public.call_has_faps
            ADD CONSTRAINT call_has_faps_pkey PRIMARY KEY (call_id, fap_id);



        ALTER TABLE ONLY public.call_has_instruments
            ADD CONSTRAINT call_has_instrument_pkey PRIMARY KEY (call_id, instrument_id);



        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_pkey PRIMARY KEY (call_id);



        ALTER TABLE ONLY public.proposal_workflow_connection_has_actions
            ADD CONSTRAINT connection_has_actions_pkey PRIMARY KEY (connection_id, action_id);



        ALTER TABLE ONLY public.countries
            ADD CONSTRAINT countries_country_id_key UNIQUE (country_id);



        ALTER TABLE ONLY public.countries
            ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);




        ALTER TABLE ONLY public.event_logs
            ADD CONSTRAINT event_logs_pkey PRIMARY KEY (id);



        ALTER TABLE ONLY public.experiment_safety_inputs
            ADD CONSTRAINT experiment_safety_inputs_pkey PRIMARY KEY (esi_id);



        ALTER TABLE ONLY public.experiment_safety_inputs
            ADD CONSTRAINT experiment_safety_inputs_questionary_id_key UNIQUE (questionary_id);



        ALTER TABLE ONLY public.fap_assignments
            ADD CONSTRAINT fap_assignments_pkey PRIMARY KEY (proposal_pk, fap_member_user_id, fap_id);



        ALTER TABLE ONLY public.fap_chairs
            ADD CONSTRAINT fap_chairs_pkey PRIMARY KEY (user_id, fap_id);



        ALTER TABLE ONLY public.fap_meeting_decisions
            ADD CONSTRAINT fap_meeting_decisions_pkey PRIMARY KEY (proposal_pk, instrument_id);



        ALTER TABLE ONLY public.fap_proposals
            ADD CONSTRAINT fap_proposals_fap_proposal_id_key UNIQUE (fap_proposal_id);



        ALTER TABLE ONLY public.fap_proposals
            ADD CONSTRAINT fap_proposals_pkey PRIMARY KEY (fap_proposal_id);



        ALTER TABLE ONLY public.fap_reviewers
            ADD CONSTRAINT fap_reviewers_pkey PRIMARY KEY (user_id, fap_id);



        ALTER TABLE ONLY public.fap_reviews
            ADD CONSTRAINT fap_reviews_pkey PRIMARY KEY (proposal_pk, user_id, fap_id);



        ALTER TABLE ONLY public.fap_secretaries
            ADD CONSTRAINT fap_secretaries_pkey PRIMARY KEY (user_id, fap_id);



        ALTER TABLE ONLY public.faps
            ADD CONSTRAINT faps_pkey PRIMARY KEY (fap_id);



        ALTER TABLE ONLY public.features
            ADD CONSTRAINT features_pkey PRIMARY KEY (feature_id);



        ALTER TABLE ONLY public.feedback_requests
            ADD CONSTRAINT feedback_requests_pkey PRIMARY KEY (feedback_request_id);



        ALTER TABLE ONLY public.feedbacks
            ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (feedback_id);



        ALTER TABLE ONLY public.files
            ADD CONSTRAINT files_oid_key UNIQUE (oid);



        ALTER TABLE ONLY public.files
            ADD CONSTRAINT files_pkey PRIMARY KEY (file_id);



        ALTER TABLE ONLY public.generic_templates
            ADD CONSTRAINT generic_templates_pkey PRIMARY KEY (generic_template_id);



        ALTER TABLE ONLY public.institutions
            ADD CONSTRAINT institutions_institution_id_key UNIQUE (institution_id);



        ALTER TABLE ONLY public.institutions
            ADD CONSTRAINT institutions_pkey PRIMARY KEY (institution_id);



        ALTER TABLE ONLY public.instrument_has_proposals
            ADD CONSTRAINT instrument_has_proposals_instrument_has_proposals_id_key UNIQUE (instrument_has_proposals_id);



        ALTER TABLE ONLY public.instrument_has_proposals
            ADD CONSTRAINT instrument_has_proposals_pkey PRIMARY KEY (instrument_id, proposal_pk);



        ALTER TABLE ONLY public.instrument_has_scientists
            ADD CONSTRAINT instrument_has_scientists_pkey PRIMARY KEY (instrument_id, user_id);



        ALTER TABLE ONLY public.instruments
            ADD CONSTRAINT instruments_pkey PRIMARY KEY (instrument_id);



        ALTER TABLE ONLY public.internal_reviews
            ADD CONSTRAINT internal_reviews_pkey PRIMARY KEY (internal_review_id);



        ALTER TABLE ONLY public.merging_table_registry
            ADD CONSTRAINT merging_table_registry_pkey PRIMARY KEY (table_name, column_name);



        ALTER TABLE ONLY public.nationalities
            ADD CONSTRAINT nationalities_nationality_id_key UNIQUE (nationality_id);



        ALTER TABLE ONLY public.nationalities
            ADD CONSTRAINT nationalities_pkey PRIMARY KEY (nationality_id);



        ALTER TABLE ONLY public.status_changing_events
            ADD CONSTRAINT next_status_events_pkey PRIMARY KEY (status_changing_event_id);



        ALTER TABLE ONLY public.old_files
            ADD CONSTRAINT old_files_oid_key UNIQUE (oid);



        ALTER TABLE ONLY public.old_files
            ADD CONSTRAINT old_files_pkey PRIMARY KEY (file_id);



        ALTER TABLE ONLY public.pagetext
            ADD CONSTRAINT pagetext_pkey PRIMARY KEY (pagetext_id);



        ALTER TABLE ONLY public.pdf_templates
            ADD CONSTRAINT pdf_templates_pkey PRIMARY KEY (pdf_template_id);



        ALTER TABLE ONLY public.pdf_templates
            ADD CONSTRAINT pdf_templates_template_id_key UNIQUE (template_id);



        ALTER TABLE ONLY public.predefined_messages
            ADD CONSTRAINT predefined_messages_pkey PRIMARY KEY (predefined_message_id);



        ALTER TABLE ONLY public.proposal_events
            ADD CONSTRAINT proposal_events_pkey PRIMARY KEY (proposal_pk);



        ALTER TABLE ONLY public.proposal_status_actions
            ADD CONSTRAINT proposal_status_actions_proposal_status_action_id_key UNIQUE (proposal_status_action_id);



        ALTER TABLE ONLY public.proposal_statuses
            ADD CONSTRAINT proposal_statuses_pkey PRIMARY KEY (proposal_status_id);



        ALTER TABLE ONLY public.proposal_user
            ADD CONSTRAINT proposal_user_pkey PRIMARY KEY (proposal_pk, user_id);



        ALTER TABLE ONLY public.proposal_workflow_connections
            ADD CONSTRAINT proposal_workflow_connections_pkey PRIMARY KEY (proposal_workflow_connection_id);



        ALTER TABLE ONLY public.proposal_workflows
            ADD CONSTRAINT proposal_workflows_pkey PRIMARY KEY (proposal_workflow_id);



        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_pkey PRIMARY KEY (proposal_pk);



        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_short_code_key UNIQUE (proposal_id);



        ALTER TABLE ONLY public.quantities
            ADD CONSTRAINT quantities_pkey PRIMARY KEY (quantity_id);



        ALTER TABLE ONLY public.question_datatypes
            ADD CONSTRAINT question_datatypes_pkey PRIMARY KEY (question_datatype_id);



        ALTER TABLE ONLY public.question_dependencies
            ADD CONSTRAINT question_dependencies_pkey PRIMARY KEY (question_dependency_id);



        ALTER TABLE ONLY public.questionaries
            ADD CONSTRAINT questionaries_pkey PRIMARY KEY (questionary_id);



        ALTER TABLE ONLY public.questions_has_template
            ADD CONSTRAINT questions_has_template_pkey PRIMARY KEY (template_id, question_id);



        ALTER TABLE ONLY public.questions
            ADD CONSTRAINT questions_natural_key_key UNIQUE (natural_key);



        ALTER TABLE ONLY public.questions
            ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);



        ALTER TABLE ONLY public.redeem_codes
            ADD CONSTRAINT redeem_codes_pkey PRIMARY KEY (code);



        ALTER TABLE ONLY public.redeem_codes
            ADD CONSTRAINT redeem_codes_placeholder_user_id_key UNIQUE (placeholder_user_id);



        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_user_id);



        ALTER TABLE ONLY public.roles
            ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);



        ALTER TABLE ONLY public.sample_experiment_safety_inputs
            ADD CONSTRAINT sample_experiment_safety_inputs_pkey PRIMARY KEY (esi_id, sample_id);



        ALTER TABLE ONLY public.sample_experiment_safety_inputs
            ADD CONSTRAINT sample_experiment_safety_inputs_questionary_id_key UNIQUE (questionary_id);



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_pkey PRIMARY KEY (sample_id);



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_questionary_id_key UNIQUE (questionary_id);



        ALTER TABLE ONLY public.scheduled_events
            ADD CONSTRAINT scheduled_events_pkey PRIMARY KEY (scheduled_event_id);



        ALTER TABLE ONLY public.settings
            ADD CONSTRAINT settings_pkey PRIMARY KEY (settings_id);



        ALTER TABLE ONLY public.shipments_has_samples
            ADD CONSTRAINT shipments_has_samples_pkey PRIMARY KEY (shipment_id, sample_id);



        ALTER TABLE ONLY public.shipments
            ADD CONSTRAINT shipments_pkey PRIMARY KEY (shipment_id);



        ALTER TABLE ONLY public.technical_review
            ADD CONSTRAINT technical_review_pkey PRIMARY KEY (technical_review_id);



        ALTER TABLE ONLY public.technique_has_instruments
            ADD CONSTRAINT technique_has_instruments_pkey PRIMARY KEY (technique_id, instrument_id);



        ALTER TABLE ONLY public.technique_has_scientists
            ADD CONSTRAINT technique_has_scientists_pkey PRIMARY KEY (technique_id, user_id);



        ALTER TABLE ONLY public.techniques
            ADD CONSTRAINT techniques_pkey PRIMARY KEY (technique_id);



        ALTER TABLE ONLY public.techniques
            ADD CONSTRAINT techniques_short_code_key UNIQUE (short_code);



        ALTER TABLE ONLY public.template_categories
            ADD CONSTRAINT template_categories_pkey PRIMARY KEY (template_category_id);



        ALTER TABLE ONLY public.template_groups
            ADD CONSTRAINT template_groups_pkey PRIMARY KEY (template_group_id);



        ALTER TABLE ONLY public.templates_has_questions
            ADD CONSTRAINT templates_has_questions_pkey PRIMARY KEY (template_id, question_id);



        ALTER TABLE ONLY public.templates
            ADD CONSTRAINT templates_pkey PRIMARY KEY (template_id);



        ALTER TABLE ONLY public.topic_completenesses
            ADD CONSTRAINT topic_completenesses_pkey PRIMARY KEY (questionary_id, topic_id);



        ALTER TABLE ONLY public.topics
            ADD CONSTRAINT topics_pkey PRIMARY KEY (topic_id);



        ALTER TABLE ONLY public.status_changing_events
            ADD CONSTRAINT unique_connection_event UNIQUE (proposal_workflow_connection_id, status_changing_event);



        ALTER TABLE ONLY public.units
            ADD CONSTRAINT units_pkey PRIMARY KEY (unit_id);



        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT user_role_unique_idx UNIQUE (user_id, role_id);



        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_email_key UNIQUE (email);



        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);



        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_username_key UNIQUE (username);



        ALTER TABLE ONLY public.visits
            ADD CONSTRAINT visitations_pkey PRIMARY KEY (visit_id);



        ALTER TABLE ONLY public.visits_has_users
            ADD CONSTRAINT visits_has_users_pkey PRIMARY KEY (visit_id, user_id);



        ALTER TABLE ONLY public.visits
            ADD CONSTRAINT visits_scheduled_event_id UNIQUE (scheduled_event_id);



        CREATE INDEX answers_questionary_id_idx ON public.answers USING btree (questionary_id);



        CREATE UNIQUE INDEX proposals_short_code_idx ON public.proposals USING btree (proposal_id);



        CREATE INDEX samples_proposal_id_question_id_mm_idx ON public.samples USING btree (proposal_pk, question_id);



        CREATE INDEX templates_has_questions_template_id_idx ON public.templates_has_questions USING btree (template_id);



        CREATE INDEX topic_completenesses_questionary_id_idx ON public.topic_completenesses USING btree (questionary_id);



        CREATE INDEX topics_template_id_idx ON public.topics USING btree (template_id);



        CREATE INDEX ux_proposal_topic_completenesses_proposal_id ON public.topic_completenesses USING btree (questionary_id);



        CREATE TRIGGER after_experiment_safety_inputs_delete_trigger AFTER DELETE ON public.experiment_safety_inputs FOR EACH ROW EXECUTE FUNCTION public.after_esi_delete();



        CREATE TRIGGER after_sample_experiment_safety_inputs_delete_trigger AFTER DELETE ON public.sample_experiment_safety_inputs FOR EACH ROW EXECUTE FUNCTION public.after_esi_delete();



        CREATE TRIGGER generic_templates_delete_trigger AFTER DELETE ON public.generic_templates FOR EACH ROW EXECUTE FUNCTION public.after_generic_template_delete();



        CREATE TRIGGER proposal_delete_trigger AFTER DELETE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.after_proposal_delete();



        CREATE TRIGGER sample_delete_trigger AFTER DELETE ON public.samples FOR EACH ROW EXECUTE FUNCTION public.after_sample_delete();



        CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();



        CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();



        CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();



        CREATE TRIGGER shipment_delete_trigger AFTER DELETE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.after_shipment_delete();



        ALTER TABLE ONLY public.active_templates
            ADD CONSTRAINT active_templates_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.template_groups(template_group_id);



        ALTER TABLE ONLY public.active_templates
            ADD CONSTRAINT active_templates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.answers
            ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);



        ALTER TABLE ONLY public.answers
            ADD CONSTRAINT answers_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_esi_template_id_fkey FOREIGN KEY (esi_template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_fap_review_template_id_fkey FOREIGN KEY (fap_review_template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.call_has_faps
            ADD CONSTRAINT call_has_faps_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(call_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.call_has_faps
            ADD CONSTRAINT call_has_faps_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.call_has_instruments
            ADD CONSTRAINT call_has_instrument_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(call_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.call_has_instruments
            ADD CONSTRAINT call_has_instrument_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.call_has_instruments
            ADD CONSTRAINT call_has_instruments_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_pdf_template_id_fkey FOREIGN KEY (pdf_template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_proposal_workflow_id_fkey FOREIGN KEY (proposal_workflow_id) REFERENCES public.proposal_workflows(proposal_workflow_id);



        ALTER TABLE ONLY public.call
            ADD CONSTRAINT call_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.institutions
            ADD CONSTRAINT country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(country_id);



        ALTER TABLE ONLY public.event_logs
            ADD CONSTRAINT event_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.experiment_safety_inputs
            ADD CONSTRAINT experiment_safety_inputs_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.experiment_safety_inputs
            ADD CONSTRAINT experiment_safety_inputs_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.experiment_safety_inputs
            ADD CONSTRAINT experiment_safety_inputs_scheduled_events_scheduled_event_id_fk FOREIGN KEY (scheduled_event_id) REFERENCES public.scheduled_events(scheduled_event_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_assignments
            ADD CONSTRAINT fap_assignments_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id);



        ALTER TABLE ONLY public.fap_assignments
            ADD CONSTRAINT fap_assignments_fap_member_user_id_fkey FOREIGN KEY (fap_member_user_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.fap_assignments
            ADD CONSTRAINT fap_assignments_fap_proposal_id_fkey FOREIGN KEY (fap_proposal_id) REFERENCES public.fap_proposals(fap_proposal_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_assignments
            ADD CONSTRAINT fap_assignments_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk);



        ALTER TABLE ONLY public.fap_chairs
            ADD CONSTRAINT fap_chairs_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_chairs
            ADD CONSTRAINT fap_chairs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_meeting_decisions
            ADD CONSTRAINT fap_meeting_decisions_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_meeting_decisions
            ADD CONSTRAINT fap_meeting_decisions_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_meeting_decisions
            ADD CONSTRAINT fap_meeting_decisions_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_meeting_decisions
            ADD CONSTRAINT fap_meeting_decisions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(user_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.fap_proposals
            ADD CONSTRAINT fap_proposals_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id);



        ALTER TABLE ONLY public.fap_proposals
            ADD CONSTRAINT fap_proposals_instrument_has_proposals_id_fkey FOREIGN KEY (instrument_has_proposals_id) REFERENCES public.instrument_has_proposals(instrument_has_proposals_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_proposals
            ADD CONSTRAINT fap_proposals_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id);



        ALTER TABLE ONLY public.fap_proposals
            ADD CONSTRAINT fap_proposals_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_reviewers
            ADD CONSTRAINT fap_reviewers_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_reviewers
            ADD CONSTRAINT fap_reviewers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_reviews
            ADD CONSTRAINT fap_reviews_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id);



        ALTER TABLE ONLY public.fap_reviews
            ADD CONSTRAINT fap_reviews_fap_proposal_id_fkey FOREIGN KEY (fap_proposal_id) REFERENCES public.fap_proposals(fap_proposal_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_reviews
            ADD CONSTRAINT fap_reviews_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.fap_reviews
            ADD CONSTRAINT fap_reviews_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id);



        ALTER TABLE ONLY public.fap_reviews
            ADD CONSTRAINT fap_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.fap_secretaries
            ADD CONSTRAINT fap_secretaries_fap_id_fkey FOREIGN KEY (fap_id) REFERENCES public.faps(fap_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.fap_secretaries
            ADD CONSTRAINT fap_secretaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.feedback_requests
            ADD CONSTRAINT feedback_requests_scheduled_event_id_fkey FOREIGN KEY (scheduled_event_id) REFERENCES public.scheduled_events(scheduled_event_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.feedbacks
            ADD CONSTRAINT feedbacks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.feedbacks
            ADD CONSTRAINT feedbacks_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id);



        ALTER TABLE ONLY public.feedbacks
            ADD CONSTRAINT feedbacks_scheduled_event_id_fkey FOREIGN KEY (scheduled_event_id) REFERENCES public.scheduled_events(scheduled_event_id);



        ALTER TABLE ONLY public.generic_templates
            ADD CONSTRAINT generic_templates_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.generic_templates
            ADD CONSTRAINT generic_templates_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.generic_templates
            ADD CONSTRAINT generic_templates_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.generic_templates
            ADD CONSTRAINT generic_templates_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.instrument_has_proposals
            ADD CONSTRAINT instrument_has_proposals_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.instrument_has_proposals
            ADD CONSTRAINT instrument_has_proposals_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.instrument_has_scientists
            ADD CONSTRAINT instrument_has_scientists_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.instrument_has_scientists
            ADD CONSTRAINT instrument_has_scientists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.instruments
            ADD CONSTRAINT instruments_manager_user_id_fkey FOREIGN KEY (manager_user_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.internal_reviews
            ADD CONSTRAINT internal_reviews_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(user_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.internal_reviews
            ADD CONSTRAINT internal_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.internal_reviews
            ADD CONSTRAINT internal_reviews_technical_review_id_fkey FOREIGN KEY (technical_review_id) REFERENCES public.technical_review(technical_review_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.status_changing_events
            ADD CONSTRAINT next_status_events_proposal_workflow_connection_id_fkey FOREIGN KEY (proposal_workflow_connection_id) REFERENCES public.proposal_workflow_connections(proposal_workflow_connection_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.pdf_templates
            ADD CONSTRAINT pdf_templates_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.pdf_templates
            ADD CONSTRAINT pdf_templates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.predefined_messages
            ADD CONSTRAINT predefined_messages_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.proposal_events
            ADD CONSTRAINT proposal_events_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_user
            ADD CONSTRAINT proposal_user_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_user
            ADD CONSTRAINT proposal_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connection_has_actions
            ADD CONSTRAINT proposal_workflow_connection_has_actions_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.proposal_status_actions(proposal_status_action_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connection_has_actions
            ADD CONSTRAINT proposal_workflow_connection_has_actions_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.proposal_workflow_connections(proposal_workflow_connection_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connection_has_actions
            ADD CONSTRAINT proposal_workflow_connection_has_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.proposal_workflows(proposal_workflow_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connections
            ADD CONSTRAINT proposal_workflow_connections_next_proposal_status_id_fkey FOREIGN KEY (next_proposal_status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connections
            ADD CONSTRAINT proposal_workflow_connections_prev_proposal_status_id_fkey FOREIGN KEY (prev_proposal_status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connections
            ADD CONSTRAINT proposal_workflow_connections_proposal_status_id_fkey FOREIGN KEY (proposal_status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposal_workflow_connections
            ADD CONSTRAINT proposal_workflow_connections_proposal_workflow_id_fkey FOREIGN KEY (proposal_workflow_id) REFERENCES public.proposal_workflows(proposal_workflow_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(call_id);



        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_proposal_statuses_id_fkey FOREIGN KEY (status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.proposals
            ADD CONSTRAINT proposals_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id);



        ALTER TABLE ONLY public.question_dependencies
            ADD CONSTRAINT question_dependencies_dependency_question_id_fkey FOREIGN KEY (dependency_question_id) REFERENCES public.questions(question_id);



        ALTER TABLE ONLY public.question_dependencies
            ADD CONSTRAINT question_dependencies_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);



        ALTER TABLE ONLY public.question_dependencies
            ADD CONSTRAINT question_dependencies_template_id_dependency_question_id_fkey FOREIGN KEY (template_id, dependency_question_id) REFERENCES public.templates_has_questions(template_id, question_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.question_dependencies
            ADD CONSTRAINT question_dependencies_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.questionaries
            ADD CONSTRAINT questionaries_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.questionaries
            ADD CONSTRAINT questionaries_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.questions
            ADD CONSTRAINT questions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.template_categories(template_category_id);



        ALTER TABLE ONLY public.questions
            ADD CONSTRAINT questions_data_type_fkey FOREIGN KEY (data_type) REFERENCES public.question_datatypes(question_datatype_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.questions_has_template
            ADD CONSTRAINT questions_has_template_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);



        ALTER TABLE ONLY public.questions_has_template
            ADD CONSTRAINT questions_has_template_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);



        ALTER TABLE ONLY public.redeem_codes
            ADD CONSTRAINT redeem_codes_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.redeem_codes
            ADD CONSTRAINT redeem_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.redeem_codes
            ADD CONSTRAINT redeem_codes_placeholder_user_id_fkey FOREIGN KEY (placeholder_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT role_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.role_user
            ADD CONSTRAINT role_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.sample_experiment_safety_inputs
            ADD CONSTRAINT sample_experiment_safety_inputs_esi_id_fkey FOREIGN KEY (esi_id) REFERENCES public.experiment_safety_inputs(esi_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.sample_experiment_safety_inputs
            ADD CONSTRAINT sample_experiment_safety_inputs_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.sample_experiment_safety_inputs
            ADD CONSTRAINT sample_experiment_safety_inputs_sample_id_fkey FOREIGN KEY (sample_id) REFERENCES public.samples(sample_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.samples
            ADD CONSTRAINT samples_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.template_categories(template_category_id);



        ALTER TABLE ONLY public.scheduled_events
            ADD CONSTRAINT scheduled_events_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id);



        ALTER TABLE ONLY public.scheduled_events
            ADD CONSTRAINT scheduled_events_local_contact_fkey FOREIGN KEY (local_contact) REFERENCES public.users(user_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.scheduled_events
            ADD CONSTRAINT scheduled_events_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.shipments
            ADD CONSTRAINT shipments_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.shipments_has_samples
            ADD CONSTRAINT shipments_has_samples_sample_id_fkey FOREIGN KEY (sample_id) REFERENCES public.samples(sample_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.shipments_has_samples
            ADD CONSTRAINT shipments_has_samples_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(shipment_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.shipments
            ADD CONSTRAINT shipments_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.shipments
            ADD CONSTRAINT shipments_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id);



        ALTER TABLE ONLY public.shipments
            ADD CONSTRAINT shipments_scheduled_event_id_fkey FOREIGN KEY (scheduled_event_id) REFERENCES public.scheduled_events(scheduled_event_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.technical_review
            ADD CONSTRAINT technical_review_instrument_has_proposals_id_fkey FOREIGN KEY (instrument_has_proposals_id) REFERENCES public.instrument_has_proposals(instrument_has_proposals_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.technical_review
            ADD CONSTRAINT technical_review_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.technical_review
            ADD CONSTRAINT technical_review_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.technical_review
            ADD CONSTRAINT technical_review_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.technical_review
            ADD CONSTRAINT technical_review_technical_review_assignee_id_fkey FOREIGN KEY (technical_review_assignee_id) REFERENCES public.users(user_id) ON DELETE SET NULL;



        ALTER TABLE ONLY public.technique_has_instruments
            ADD CONSTRAINT technique_has_instruments_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.technique_has_instruments
            ADD CONSTRAINT technique_has_instruments_technique_id_fkey FOREIGN KEY (technique_id) REFERENCES public.techniques(technique_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.technique_has_scientists
            ADD CONSTRAINT technique_has_scientists_technique_id_fkey FOREIGN KEY (technique_id) REFERENCES public.techniques(technique_id) ON UPDATE CASCADE ON DELETE CASCADE;



        ALTER TABLE ONLY public.technique_has_scientists
            ADD CONSTRAINT technique_has_scientists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.template_groups
            ADD CONSTRAINT template_groups_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.template_categories(template_category_id);



        ALTER TABLE ONLY public.templates
            ADD CONSTRAINT templates_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.template_groups(template_group_id);



        ALTER TABLE ONLY public.templates_has_questions
            ADD CONSTRAINT templates_has_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON UPDATE CASCADE;



        ALTER TABLE ONLY public.templates_has_questions
            ADD CONSTRAINT templates_has_questions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.templates_has_questions
            ADD CONSTRAINT templates_has_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.topic_completenesses
            ADD CONSTRAINT topic_completenesses_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.topic_completenesses
            ADD CONSTRAINT topic_completenesses_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id);



        ALTER TABLE ONLY public.topics
            ADD CONSTRAINT topics_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.units
            ADD CONSTRAINT units_quantity_fkey FOREIGN KEY (quantity) REFERENCES public.quantities(quantity_id);



        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_nationality_fkey FOREIGN KEY (nationality) REFERENCES public.nationalities(nationality_id);



        ALTER TABLE ONLY public.users
            ADD CONSTRAINT users_organisation_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(institution_id);



        ALTER TABLE ONLY public.visits_has_users
            ADD CONSTRAINT visitations_has_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.visits_has_users
            ADD CONSTRAINT visitations_has_users_visitation_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(visit_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.visits
            ADD CONSTRAINT visitations_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;



        ALTER TABLE ONLY public.visits
            ADD CONSTRAINT visitations_visitor_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);



        ALTER TABLE ONLY public.visits_has_users
            ADD CONSTRAINT visits_has_users_registration_questionary_id_fkey FOREIGN KEY (registration_questionary_id) REFERENCES public.questionaries(questionary_id);



        ALTER TABLE ONLY public.visits
            ADD CONSTRAINT visits_scheduled_events_scheduled_event_id_fkey FOREIGN KEY (scheduled_event_id) REFERENCES public.scheduled_events(scheduled_event_id) ON DELETE CASCADE;



        ALTER TABLE ONLY public.visits
            ADD CONSTRAINT visits_team_lead_user_id_fkey FOREIGN KEY (team_lead_user_id) REFERENCES public.users(user_id);



        REVOKE USAGE ON SCHEMA public FROM PUBLIC;
        GRANT ALL ON SCHEMA public TO PUBLIC;

    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
