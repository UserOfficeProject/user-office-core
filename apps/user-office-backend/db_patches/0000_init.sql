DO
$DO$
BEGIN
	IF register_patch('init.sql', 'unknown', 'init', '2019-10-01 00:00:00.000000+00') THEN
	BEGIN


   --
-- PostgreSQL database dump
--

-- Dumped from database version 11.18
-- Dumped by pg_dump version 14.5 (Ubuntu 14.5-0ubuntu0.22.04.1)

-- Started on 2023-01-10 17:46:10 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
PERFORM pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3718 (class 1262 OID 16384)
-- Name: duo; Type: DATABASE; Schema: -; Owner: duouser
--



--
-- TOC entry 2 (class 3079 OID 17334)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3719 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 298 (class 1255 OID 17586)
-- Name: after_proposal_delete(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 299 (class 1255 OID 17588)
-- Name: after_sample_delete(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 315 (class 1255 OID 17590)
-- Name: after_shipment_delete(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 296 (class 1255 OID 17037)
-- Name: createquestionary(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 289 (class 1255 OID 16397)
-- Name: file_id_pseudo_encrypt(bigint); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 295 (class 1255 OID 16647)
-- Name: generate_proposal_shortcode(bigint); Type: FUNCTION; Schema: public; Owner: duouser
--

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
			RETURN new_shortcode;
		END;
		$$;


ALTER FUNCTION public.generate_proposal_shortcode(id bigint) OWNER TO duouser;

--
-- TOC entry 284 (class 1255 OID 16396)
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

--
-- TOC entry 282 (class 1255 OID 16395)
-- Name: unregister_patch(text); Type: FUNCTION; Schema: public; Owner: duouser
--


SET default_tablespace = '';

--
-- TOC entry 208 (class 1259 OID 16483)
-- Name: answers; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.answers (
    answer_id integer NOT NULL,
    questionary_id integer NOT NULL,
    question_id character varying(64) NOT NULL,
    answer jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.answers OWNER TO duouser;

--
-- TOC entry 314 (class 1255 OID 17322)
-- Name: update_answers(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 313 (class 1255 OID 17050)
-- Name: updateanswers(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 312 (class 1255 OID 17044)
-- Name: updatecompletenesses(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 297 (class 1255 OID 17038)
-- Name: updateproposalstable(); Type: FUNCTION; Schema: public; Owner: duouser
--

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

--
-- TOC entry 235 (class 1259 OID 16776)
-- Name: SEP_Assignments; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public."SEP_Assignments" (
    proposal_pk integer NOT NULL,
    sep_member_user_id integer NOT NULL,
    sep_id integer NOT NULL,
    date_assigned timestamp with time zone DEFAULT now() NOT NULL,
    reassigned boolean DEFAULT false,
    date_reassigned timestamp with time zone,
    email_sent boolean DEFAULT false
);


ALTER TABLE public."SEP_Assignments" OWNER TO duouser;

--
-- TOC entry 241 (class 1259 OID 16961)
-- Name: SEP_Proposals; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public."SEP_Proposals" (
    proposal_pk integer NOT NULL,
    sep_id integer NOT NULL,
    date_assigned timestamp with time zone DEFAULT now() NOT NULL,
    call_id integer,
    sep_time_allocation integer
);


ALTER TABLE public."SEP_Proposals" OWNER TO duouser;

--
-- TOC entry 274 (class 1259 OID 17508)
-- Name: SEP_Reviewers; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public."SEP_Reviewers" (
    user_id integer NOT NULL,
    sep_id integer NOT NULL
);


ALTER TABLE public."SEP_Reviewers" OWNER TO duouser;

--
-- TOC entry 214 (class 1259 OID 16561)
-- Name: SEP_Reviews; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public."SEP_Reviews" (
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    proposal_pk integer NOT NULL,
    comment character varying(500),
    grade integer,
    status integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sep_id integer
);


ALTER TABLE public."SEP_Reviews" OWNER TO duouser;

--
-- TOC entry 275 (class 1259 OID 17550)
-- Name: SEP_meeting_decisions; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public."SEP_meeting_decisions" (
    proposal_pk integer NOT NULL,
    comment_for_management character varying(500),
    comment_for_user character varying(500),
    rank_order integer,
    recommendation integer,
    submitted boolean DEFAULT false,
    submitted_by integer
);


ALTER TABLE public."SEP_meeting_decisions" OWNER TO duouser;

--
-- TOC entry 234 (class 1259 OID 16766)
-- Name: SEPs; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public."SEPs" (
    sep_id integer NOT NULL,
    description character varying,
    code character varying,
    number_ratings_required integer DEFAULT 2,
    active boolean,
    sep_chair_user_id integer,
    sep_secretary_user_id integer
);


ALTER TABLE public."SEPs" OWNER TO duouser;

--
-- TOC entry 233 (class 1259 OID 16764)
-- Name: SEPs_sep_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public."SEPs_sep_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SEPs_sep_id_seq" OWNER TO duouser;

--
-- TOC entry 3720 (class 0 OID 0)
-- Dependencies: 233
-- Name: SEPs_sep_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public."SEPs_sep_id_seq" OWNED BY public."SEPs".sep_id;


--
-- TOC entry 266 (class 1259 OID 17405)
-- Name: active_templates; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.active_templates (
    category_id integer NOT NULL,
    template_id integer NOT NULL
);


ALTER TABLE public.active_templates OWNER TO duouser;

--
-- TOC entry 271 (class 1259 OID 17470)
-- Name: api_permissions; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.api_permissions (
    access_token_id character varying(64) NOT NULL,
    name character varying(64) NOT NULL,
    access_token character varying(512) NOT NULL,
    access_permissions jsonb
);


ALTER TABLE public.api_permissions OWNER TO duouser;

--
-- TOC entry 218 (class 1259 OID 16611)
-- Name: call; Type: TABLE; Schema: public; Owner: duouser
--

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
    start_sep_review timestamp with time zone DEFAULT now(),
    end_sep_review timestamp with time zone DEFAULT now(),
    call_sep_review_ended boolean DEFAULT false,
    reference_number_format character varying(64),
    proposal_sequence integer,
    allocation_time_unit character varying(10) DEFAULT 'day'::character varying NOT NULL,
    CONSTRAINT call_allocation_time_unit_check CHECK (((allocation_time_unit)::text = ANY ((ARRAY['day'::character varying, 'hour'::character varying])::text[])))
);


ALTER TABLE public.call OWNER TO duouser;

--
-- TOC entry 217 (class 1259 OID 16609)
-- Name: call_call_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.call_call_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.call_call_id_seq OWNER TO duouser;

--
-- TOC entry 3721 (class 0 OID 0)
-- Dependencies: 217
-- Name: call_call_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.call_call_id_seq OWNED BY public.call.call_id;


--
-- TOC entry 249 (class 1259 OID 17084)
-- Name: call_has_instruments; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.call_has_instruments (
    call_id integer NOT NULL,
    instrument_id integer NOT NULL,
    availability_time integer,
    submitted boolean DEFAULT false
);


ALTER TABLE public.call_has_instruments OWNER TO duouser;

--
-- TOC entry 228 (class 1259 OID 16708)
-- Name: countries; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.countries (
    country_id integer NOT NULL,
    country character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.countries OWNER TO duouser;

--
-- TOC entry 227 (class 1259 OID 16706)
-- Name: countries_country_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.countries_country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.countries_country_id_seq OWNER TO duouser;

--
-- TOC entry 3722 (class 0 OID 0)
-- Dependencies: 227
-- Name: countries_country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.countries_country_id_seq OWNED BY public.countries.country_id;


--
-- TOC entry 232 (class 1259 OID 16749)
-- Name: event_logs; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.event_logs (
    id integer NOT NULL,
    changed_by integer,
    event_type text,
    row_data text,
    event_tstamp timestamp with time zone DEFAULT now() NOT NULL,
    changed_object_id text
);


ALTER TABLE public.event_logs OWNER TO duouser;

--
-- TOC entry 231 (class 1259 OID 16747)
-- Name: event_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.event_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_logs_id_seq OWNER TO duouser;

--
-- TOC entry 3723 (class 0 OID 0)
-- Dependencies: 231
-- Name: event_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.event_logs_id_seq OWNED BY public.event_logs.id;


--
-- TOC entry 270 (class 1259 OID 17459)
-- Name: features; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.features (
    feature_id character varying(128) NOT NULL,
    is_enabled boolean DEFAULT false,
    description character varying(500) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.features OWNER TO duouser;

--
-- TOC entry 263 (class 1259 OID 17355)
-- Name: files; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.files (
    file_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    file_name character varying(512) NOT NULL,
    size_in_bytes integer,
    mime_type character varying(256),
    oid integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.files OWNER TO duouser;

--
-- TOC entry 215 (class 1259 OID 16582)
-- Name: files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_file_id_seq OWNER TO duouser;

--
-- TOC entry 226 (class 1259 OID 16698)
-- Name: institutions; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.institutions (
    institution_id integer NOT NULL,
    institution character varying(100) DEFAULT NULL::character varying,
    verified boolean DEFAULT true
);


ALTER TABLE public.institutions OWNER TO duouser;

--
-- TOC entry 225 (class 1259 OID 16696)
-- Name: institutions_institution_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.institutions_institution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.institutions_institution_id_seq OWNER TO duouser;

--
-- TOC entry 3724 (class 0 OID 0)
-- Dependencies: 225
-- Name: institutions_institution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.institutions_institution_id_seq OWNED BY public.institutions.institution_id;


--
-- TOC entry 250 (class 1259 OID 17099)
-- Name: instrument_has_proposals; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.instrument_has_proposals (
    instrument_id integer NOT NULL,
    proposal_pk integer NOT NULL,
    submitted boolean DEFAULT false
);


ALTER TABLE public.instrument_has_proposals OWNER TO duouser;

--
-- TOC entry 251 (class 1259 OID 17119)
-- Name: instrument_has_scientists; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.instrument_has_scientists (
    instrument_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.instrument_has_scientists OWNER TO duouser;

--
-- TOC entry 248 (class 1259 OID 17075)
-- Name: instruments; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.instruments (
    instrument_id integer NOT NULL,
    name character varying(200) NOT NULL,
    short_code character varying(20) NOT NULL,
    description text,
    manager_user_id integer NOT NULL
);


ALTER TABLE public.instruments OWNER TO duouser;

--
-- TOC entry 247 (class 1259 OID 17073)
-- Name: instruments_instrument_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.instruments_instrument_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.instruments_instrument_id_seq OWNER TO duouser;

--
-- TOC entry 3725 (class 0 OID 0)
-- Dependencies: 247
-- Name: instruments_instrument_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.instruments_instrument_id_seq OWNED BY public.instruments.instrument_id;


--
-- TOC entry 224 (class 1259 OID 16689)
-- Name: nationalities; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.nationalities (
    nationality_id integer NOT NULL,
    nationality character varying(50) DEFAULT NULL::character varying
);


ALTER TABLE public.nationalities OWNER TO duouser;

--
-- TOC entry 223 (class 1259 OID 16687)
-- Name: nationalities_nationality_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.nationalities_nationality_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nationalities_nationality_id_seq OWNER TO duouser;

--
-- TOC entry 3726 (class 0 OID 0)
-- Dependencies: 223
-- Name: nationalities_nationality_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.nationalities_nationality_id_seq OWNED BY public.nationalities.nationality_id;


--
-- TOC entry 261 (class 1259 OID 17255)
-- Name: status_changing_events; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.status_changing_events (
    status_changing_event_id integer NOT NULL,
    proposal_workflow_connection_id integer,
    status_changing_event character varying(50) NOT NULL
);


ALTER TABLE public.status_changing_events OWNER TO duouser;

--
-- TOC entry 260 (class 1259 OID 17253)
-- Name: next_status_events_next_status_event_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.next_status_events_next_status_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.next_status_events_next_status_event_id_seq OWNER TO duouser;

--
-- TOC entry 3727 (class 0 OID 0)
-- Dependencies: 260
-- Name: next_status_events_next_status_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.next_status_events_next_status_event_id_seq OWNED BY public.status_changing_events.status_changing_event_id;


--
-- TOC entry 216 (class 1259 OID 16584)
-- Name: old_files; Type: TABLE; Schema: public; Owner: duouser
--

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

--
-- TOC entry 220 (class 1259 OID 16619)
-- Name: pagetext; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.pagetext (
    pagetext_id integer NOT NULL,
    content text
);


ALTER TABLE public.pagetext OWNER TO duouser;

--
-- TOC entry 219 (class 1259 OID 16617)
-- Name: pagetext_pagetext_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.pagetext_pagetext_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pagetext_pagetext_id_seq OWNER TO duouser;

--
-- TOC entry 3728 (class 0 OID 0)
-- Dependencies: 219
-- Name: pagetext_pagetext_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.pagetext_pagetext_id_seq OWNED BY public.pagetext.pagetext_id;


--
-- TOC entry 207 (class 1259 OID 16481)
-- Name: proposal_answers_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_answers_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_answers_answer_id_seq OWNER TO duouser;

--
-- TOC entry 3729 (class 0 OID 0)
-- Dependencies: 207
-- Name: proposal_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_answers_answer_id_seq OWNED BY public.answers.answer_id;


--
-- TOC entry 262 (class 1259 OID 17273)
-- Name: proposal_events; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_events (
    proposal_pk integer NOT NULL,
    proposal_created boolean DEFAULT false,
    proposal_submitted boolean DEFAULT false,
    call_ended boolean DEFAULT false,
    proposal_sep_selected boolean DEFAULT false,
    proposal_instrument_selected boolean DEFAULT false,
    proposal_feasibility_review_submitted boolean DEFAULT false,
    proposal_sample_review_submitted boolean DEFAULT false,
    proposal_all_sep_reviewers_selected boolean DEFAULT false,
    proposal_sep_review_submitted boolean DEFAULT false,
    proposal_sep_meeting_submitted boolean DEFAULT false,
    proposal_instrument_submitted boolean DEFAULT false,
    proposal_accepted boolean DEFAULT false,
    proposal_rejected boolean DEFAULT false,
    proposal_notified boolean DEFAULT false,
    call_review_ended boolean DEFAULT false,
    call_sep_review_ended boolean DEFAULT false,
    proposal_feasible boolean DEFAULT false,
    proposal_sample_safe boolean DEFAULT false,
    proposal_management_decision_submitted boolean DEFAULT false,
    proposal_all_sep_reviews_submitted boolean DEFAULT false,
    proposal_sep_review_updated boolean DEFAULT false,
    proposal_feasibility_review_updated boolean DEFAULT false,
    proposal_management_decision_updated boolean DEFAULT false,
    proposal_unfeasible boolean DEFAULT false,
    proposal_status_updated boolean DEFAULT false,
    proposal_sep_meeting_saved boolean DEFAULT false,
    proposal_sep_meeting_ranking_overwritten boolean DEFAULT false,
    proposal_sep_meeting_reorder boolean DEFAULT false,
    proposal_reserved boolean DEFAULT false
);


ALTER TABLE public.proposal_events OWNER TO duouser;

--
-- TOC entry 239 (class 1259 OID 16892)
-- Name: templates_has_questions; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.templates_has_questions (
    id integer NOT NULL,
    question_id character varying(64) NOT NULL,
    template_id integer NOT NULL,
    topic_id integer NOT NULL,
    sort_order integer NOT NULL,
    config text NOT NULL,
    dependencies_operator character varying(64) DEFAULT 'AND'::character varying
);


ALTER TABLE public.templates_has_questions OWNER TO duouser;

--
-- TOC entry 238 (class 1259 OID 16890)
-- Name: proposal_question__proposal_template__rels_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_question__proposal_template__rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_question__proposal_template__rels_id_seq OWNER TO duouser;

--
-- TOC entry 3730 (class 0 OID 0)
-- Dependencies: 238
-- Name: proposal_question__proposal_template__rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_question__proposal_template__rels_id_seq OWNED BY public.templates_has_questions.id;


--
-- TOC entry 255 (class 1259 OID 17200)
-- Name: proposal_statuses; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_statuses (
    proposal_status_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(200) NOT NULL,
    is_default boolean DEFAULT false,
    short_code character varying(50) NOT NULL
);


ALTER TABLE public.proposal_statuses OWNER TO duouser;

--
-- TOC entry 254 (class 1259 OID 17198)
-- Name: proposal_statuses_proposal_status_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_statuses_proposal_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_statuses_proposal_status_id_seq OWNER TO duouser;

--
-- TOC entry 3731 (class 0 OID 0)
-- Dependencies: 254
-- Name: proposal_statuses_proposal_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_statuses_proposal_status_id_seq OWNED BY public.proposal_statuses.proposal_status_id;


--
-- TOC entry 222 (class 1259 OID 16645)
-- Name: proposals_short_code_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposals_short_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 999999
    CACHE 1;


ALTER TABLE public.proposals_short_code_seq OWNER TO duouser;

--
-- TOC entry 201 (class 1259 OID 16423)
-- Name: proposals; Type: TABLE; Schema: public; Owner: duouser
--

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
    management_time_allocation integer,
    reference_number_sequence integer,
    technical_review_assignee integer,
    risk_assessment_questionary_id integer
);


ALTER TABLE public.proposals OWNER TO duouser;

--
-- TOC entry 230 (class 1259 OID 16729)
-- Name: technical_review; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.technical_review (
    technical_review_id integer NOT NULL,
    proposal_pk integer,
    comment text,
    time_allocation integer,
    status integer,
    public_comment text,
    submitted boolean DEFAULT false,
    reviewer_id integer NOT NULL
);


ALTER TABLE public.technical_review OWNER TO duouser;

--
-- TOC entry 280 (class 1259 OID 17669)
-- Name: proposal_table_view; Type: VIEW; Schema: public; Owner: duouser
--

CREATE VIEW public.proposal_table_view AS
 SELECT p.proposal_pk,
    p.title,
    p.status_id AS proposal_status_id,
    ps.name AS proposal_status_name,
    ps.description AS proposal_status_description,
    p.proposal_id,
    smd.rank_order,
    p.final_status,
    p.notified,
    p.questionary_id,
    t.time_allocation,
    t.status AS technical_review_status,
    i.name AS instrument_name,
    c.call_short_code,
    s.code AS sep_code,
    s.sep_id,
    c.allocation_time_unit,
    c.call_id,
    i.instrument_id,
    ( SELECT round(avg("SEP_Reviews".grade), 1) AS round
           FROM public."SEP_Reviews"
          WHERE ("SEP_Reviews".proposal_pk = p.proposal_pk)) AS average,
    ( SELECT round(stddev_pop("SEP_Reviews".grade), 1) AS round
           FROM public."SEP_Reviews"
          WHERE ("SEP_Reviews".proposal_pk = p.proposal_pk)) AS deviation,
    p.submitted
   FROM ((((((((public.proposals p
     LEFT JOIN public.technical_review t ON ((t.proposal_pk = p.proposal_pk)))
     LEFT JOIN public.instrument_has_proposals ihp ON ((ihp.proposal_pk = p.proposal_pk)))
     LEFT JOIN public.proposal_statuses ps ON ((ps.proposal_status_id = p.status_id)))
     LEFT JOIN public.instruments i ON ((i.instrument_id = ihp.instrument_id)))
     LEFT JOIN public.call c ON ((c.call_id = p.call_id)))
     LEFT JOIN public."SEP_Proposals" sp ON ((sp.proposal_pk = p.proposal_pk)))
     LEFT JOIN public."SEPs" s ON ((s.sep_id = sp.sep_id)))
     LEFT JOIN public."SEP_meeting_decisions" smd ON ((smd.proposal_pk = p.proposal_pk)));


ALTER TABLE public.proposal_table_view OWNER TO duouser;

--
-- TOC entry 237 (class 1259 OID 16856)
-- Name: templates; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.templates (
    template_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    is_archived boolean DEFAULT false,
    category_id integer NOT NULL
);


ALTER TABLE public.templates OWNER TO duouser;

--
-- TOC entry 236 (class 1259 OID 16854)
-- Name: proposal_templates_template_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_templates_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_templates_template_id_seq OWNER TO duouser;

--
-- TOC entry 3732 (class 0 OID 0)
-- Dependencies: 236
-- Name: proposal_templates_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_templates_template_id_seq OWNED BY public.templates.template_id;


--
-- TOC entry 205 (class 1259 OID 16450)
-- Name: topics; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.topics (
    topic_id integer NOT NULL,
    topic_title character varying(32) NOT NULL,
    is_enabled boolean DEFAULT false,
    sort_order integer NOT NULL,
    template_id integer NOT NULL
);


ALTER TABLE public.topics OWNER TO duouser;

--
-- TOC entry 204 (class 1259 OID 16448)
-- Name: proposal_topics_sort_order_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_topics_sort_order_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_topics_sort_order_seq OWNER TO duouser;

--
-- TOC entry 3733 (class 0 OID 0)
-- Dependencies: 204
-- Name: proposal_topics_sort_order_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_topics_sort_order_seq OWNED BY public.topics.sort_order;


--
-- TOC entry 203 (class 1259 OID 16446)
-- Name: proposal_topics_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_topics_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_topics_topic_id_seq OWNER TO duouser;

--
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 203
-- Name: proposal_topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_topics_topic_id_seq OWNED BY public.topics.topic_id;


--
-- TOC entry 209 (class 1259 OID 16521)
-- Name: proposal_user; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_user (
    proposal_pk integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.proposal_user OWNER TO duouser;

--
-- TOC entry 259 (class 1259 OID 17216)
-- Name: proposal_workflow_connections; Type: TABLE; Schema: public; Owner: duouser
--

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

--
-- TOC entry 258 (class 1259 OID 17214)
-- Name: proposal_workflow_connections_proposal_workflow_connection__seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_workflow_connections_proposal_workflow_connection__seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_workflow_connections_proposal_workflow_connection__seq OWNER TO duouser;

--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 258
-- Name: proposal_workflow_connections_proposal_workflow_connection__seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_workflow_connections_proposal_workflow_connection__seq OWNED BY public.proposal_workflow_connections.proposal_workflow_connection_id;


--
-- TOC entry 257 (class 1259 OID 17208)
-- Name: proposal_workflows; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_workflows (
    proposal_workflow_id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200) NOT NULL
);


ALTER TABLE public.proposal_workflows OWNER TO duouser;

--
-- TOC entry 256 (class 1259 OID 17206)
-- Name: proposal_workflows_proposal_workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposal_workflows_proposal_workflow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_workflows_proposal_workflow_id_seq OWNER TO duouser;

--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 256
-- Name: proposal_workflows_proposal_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_workflows_proposal_workflow_id_seq OWNED BY public.proposal_workflows.proposal_workflow_id;


--
-- TOC entry 200 (class 1259 OID 16421)
-- Name: proposals_proposal_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.proposals_proposal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposals_proposal_id_seq OWNER TO duouser;

--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 200
-- Name: proposals_proposal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposals_proposal_id_seq OWNED BY public.proposals.proposal_pk;


--
-- TOC entry 202 (class 1259 OID 16441)
-- Name: question_datatypes; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.question_datatypes (
    question_datatype_id character varying(64) NOT NULL
);


ALTER TABLE public.question_datatypes OWNER TO duouser;

--
-- TOC entry 269 (class 1259 OID 17435)
-- Name: question_dependencies; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.question_dependencies (
    question_dependency_id integer NOT NULL,
    template_id integer NOT NULL,
    question_id character varying(64) NOT NULL,
    dependency_question_id character varying(64),
    dependency_condition jsonb
);


ALTER TABLE public.question_dependencies OWNER TO duouser;

--
-- TOC entry 268 (class 1259 OID 17433)
-- Name: question_dependencies_question_dependency_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.question_dependencies_question_dependency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.question_dependencies_question_dependency_id_seq OWNER TO duouser;

--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 268
-- Name: question_dependencies_question_dependency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.question_dependencies_question_dependency_id_seq OWNED BY public.question_dependencies.question_dependency_id;


--
-- TOC entry 245 (class 1259 OID 16999)
-- Name: questionaries; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.questionaries (
    questionary_id integer NOT NULL,
    template_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    creator_id integer
);


ALTER TABLE public.questionaries OWNER TO duouser;

--
-- TOC entry 244 (class 1259 OID 16997)
-- Name: questionaries_questionary_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.questionaries_questionary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questionaries_questionary_id_seq OWNER TO duouser;

--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 244
-- Name: questionaries_questionary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.questionaries_questionary_id_seq OWNED BY public.questionaries.questionary_id;


--
-- TOC entry 206 (class 1259 OID 16458)
-- Name: questions; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.questions (
    question_id character varying(64) NOT NULL,
    data_type character varying(64) NOT NULL,
    question character varying(256) NOT NULL,
    default_config text DEFAULT NULL::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    natural_key character varying(128),
    category_id integer NOT NULL
);


ALTER TABLE public.questions OWNER TO duouser;

--
-- TOC entry 246 (class 1259 OID 17024)
-- Name: questions_has_template; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.questions_has_template (
    template_id integer NOT NULL,
    question_id character varying(64) NOT NULL
);


ALTER TABLE public.questions_has_template OWNER TO duouser;

--
-- TOC entry 213 (class 1259 OID 16559)
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_review_id_seq OWNER TO duouser;

--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 213
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public."SEP_Reviews".review_id;


--
-- TOC entry 212 (class 1259 OID 16544)
-- Name: role_user; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.role_user (
    role_id integer NOT NULL,
    user_id integer NOT NULL,
    role_user_id integer NOT NULL
);


ALTER TABLE public.role_user OWNER TO duouser;

--
-- TOC entry 240 (class 1259 OID 16925)
-- Name: role_user_role_user_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.role_user_role_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_user_role_user_id_seq OWNER TO duouser;

--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 240
-- Name: role_user_role_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.role_user_role_user_id_seq OWNED BY public.role_user.role_user_id;


--
-- TOC entry 211 (class 1259 OID 16538)
-- Name: roles; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    short_code character varying(60) NOT NULL,
    title character varying(60) NOT NULL
);


ALTER TABLE public.roles OWNER TO duouser;

--
-- TOC entry 210 (class 1259 OID 16536)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_role_id_seq OWNER TO duouser;

--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 210
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 253 (class 1259 OID 17138)
-- Name: samples; Type: TABLE; Schema: public; Owner: duouser
--

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
    shipment_id integer
);


ALTER TABLE public.samples OWNER TO duouser;

--
-- TOC entry 252 (class 1259 OID 17136)
-- Name: samples_sample_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.samples_sample_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.samples_sample_id_seq OWNER TO duouser;

--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 252
-- Name: samples_sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.samples_sample_id_seq OWNED BY public.samples.sample_id;


--
-- TOC entry 276 (class 1259 OID 17592)
-- Name: settings; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.settings (
    settings_id character varying(128) NOT NULL,
    settings_value character varying,
    description character varying(500) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.settings OWNER TO duouser;

--
-- TOC entry 265 (class 1259 OID 17371)
-- Name: shipments; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.shipments (
    shipment_id integer NOT NULL,
    title character varying(500) DEFAULT ''::character varying NOT NULL,
    proposal_pk integer,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    external_ref character varying(200) DEFAULT NULL::character varying,
    questionary_id integer,
    creator_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    visit_id integer NOT NULL,
    CONSTRAINT shipments_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying])::text[])))
);


ALTER TABLE public.shipments OWNER TO duouser;

--
-- TOC entry 267 (class 1259 OID 17420)
-- Name: shipments_has_samples; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.shipments_has_samples (
    shipment_id integer NOT NULL,
    sample_id integer NOT NULL
);


ALTER TABLE public.shipments_has_samples OWNER TO duouser;

--
-- TOC entry 264 (class 1259 OID 17369)
-- Name: shipments_shipment_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.shipments_shipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shipments_shipment_id_seq OWNER TO duouser;

--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 264
-- Name: shipments_shipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.shipments_shipment_id_seq OWNED BY public.shipments.shipment_id;


--
-- TOC entry 229 (class 1259 OID 16727)
-- Name: technical_review_technical_review_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.technical_review_technical_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.technical_review_technical_review_id_seq OWNER TO duouser;

--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 229
-- Name: technical_review_technical_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.technical_review_technical_review_id_seq OWNED BY public.technical_review.technical_review_id;


--
-- TOC entry 243 (class 1259 OID 16991)
-- Name: template_categories; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.template_categories (
    template_category_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.template_categories OWNER TO duouser;

--
-- TOC entry 242 (class 1259 OID 16989)
-- Name: template_categories_template_category_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.template_categories_template_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_categories_template_category_id_seq OWNER TO duouser;

--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 242
-- Name: template_categories_template_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.template_categories_template_category_id_seq OWNED BY public.template_categories.template_category_id;


--
-- TOC entry 221 (class 1259 OID 16628)
-- Name: topic_completenesses; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.topic_completenesses (
    questionary_id integer NOT NULL,
    topic_id integer NOT NULL,
    is_complete boolean DEFAULT false NOT NULL
);


ALTER TABLE public.topic_completenesses OWNER TO duouser;

--
-- TOC entry 273 (class 1259 OID 17485)
-- Name: units; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.units (
    unit_id integer NOT NULL,
    unit character varying(50) DEFAULT NULL::character varying
);


ALTER TABLE public.units OWNER TO duouser;

--
-- TOC entry 272 (class 1259 OID 17483)
-- Name: units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.units_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.units_unit_id_seq OWNER TO duouser;

--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 272
-- Name: units_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.units_unit_id_seq OWNED BY public.units.unit_id;


--
-- TOC entry 199 (class 1259 OID 16400)
-- Name: users; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    user_title character varying(15) DEFAULT NULL::character varying,
    middlename character varying(100) DEFAULT NULL::character varying,
    firstname character varying(100) NOT NULL,
    lastname character varying(100) NOT NULL,
    username character varying(100),
    password character varying(100) NOT NULL,
    preferredname character varying(100) DEFAULT NULL::character varying,
    orcid character varying(100) NOT NULL,
    orcid_refreshtoken character varying(100) NOT NULL,
    gender character varying(30) NOT NULL,
    birthdate date NOT NULL,
    department character varying(100) NOT NULL,
    "position" character varying(100) NOT NULL,
    email character varying(100),
    email_verified boolean DEFAULT false,
    telephone character varying(100) NOT NULL,
    telephone_alt character varying(100) DEFAULT NULL::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    organisation integer,
    nationality integer,
    placeholder boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO duouser;

--
-- TOC entry 198 (class 1259 OID 16398)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO duouser;

--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 198
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 278 (class 1259 OID 17609)
-- Name: visits; Type: TABLE; Schema: public; Owner: duouser
--

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

--
-- TOC entry 277 (class 1259 OID 17607)
-- Name: visitations_visitation_id_seq; Type: SEQUENCE; Schema: public; Owner: duouser
--

CREATE SEQUENCE public.visitations_visitation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.visitations_visitation_id_seq OWNER TO duouser;

--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 277
-- Name: visitations_visitation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.visitations_visitation_id_seq OWNED BY public.visits.visit_id;


--
-- TOC entry 279 (class 1259 OID 17633)
-- Name: visits_has_users; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.visits_has_users (
    visit_id integer,
    user_id integer,
    registration_questionary_id integer,
    is_registration_submitted boolean DEFAULT false,
    training_expiry_date timestamp with time zone
);


ALTER TABLE public.visits_has_users OWNER TO duouser;

--
-- TOC entry 3177 (class 2604 OID 16564)
-- Name: SEP_Reviews review_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviews" ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- TOC entry 3206 (class 2604 OID 16769)
-- Name: SEPs sep_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEPs" ALTER COLUMN sep_id SET DEFAULT nextval('public."SEPs_sep_id_seq"'::regclass);


--
-- TOC entry 3173 (class 2604 OID 16486)
-- Name: answers answer_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.answers ALTER COLUMN answer_id SET DEFAULT nextval('public.proposal_answers_answer_id_seq'::regclass);


--
-- TOC entry 3183 (class 2604 OID 16614)
-- Name: call call_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call ALTER COLUMN call_id SET DEFAULT nextval('public.call_call_id_seq'::regclass);


--
-- TOC entry 3200 (class 2604 OID 16711)
-- Name: countries country_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_country_id_seq'::regclass);


--
-- TOC entry 3204 (class 2604 OID 16752)
-- Name: event_logs id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.event_logs ALTER COLUMN id SET DEFAULT nextval('public.event_logs_id_seq'::regclass);


--
-- TOC entry 3197 (class 2604 OID 16701)
-- Name: institutions institution_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.institutions ALTER COLUMN institution_id SET DEFAULT nextval('public.institutions_institution_id_seq'::regclass);


--
-- TOC entry 3219 (class 2604 OID 17078)
-- Name: instruments instrument_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instruments ALTER COLUMN instrument_id SET DEFAULT nextval('public.instruments_instrument_id_seq'::regclass);


--
-- TOC entry 3195 (class 2604 OID 16692)
-- Name: nationalities nationality_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.nationalities ALTER COLUMN nationality_id SET DEFAULT nextval('public.nationalities_nationality_id_seq'::regclass);


--
-- TOC entry 3193 (class 2604 OID 16622)
-- Name: pagetext pagetext_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.pagetext ALTER COLUMN pagetext_id SET DEFAULT nextval('public.pagetext_pagetext_id_seq'::regclass);


--
-- TOC entry 3227 (class 2604 OID 17203)
-- Name: proposal_statuses proposal_status_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_statuses ALTER COLUMN proposal_status_id SET DEFAULT nextval('public.proposal_statuses_proposal_status_id_seq'::regclass);


--
-- TOC entry 3230 (class 2604 OID 17219)
-- Name: proposal_workflow_connections proposal_workflow_connection_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflow_connections ALTER COLUMN proposal_workflow_connection_id SET DEFAULT nextval('public.proposal_workflow_connections_proposal_workflow_connection__seq'::regclass);


--
-- TOC entry 3229 (class 2604 OID 17211)
-- Name: proposal_workflows proposal_workflow_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflows ALTER COLUMN proposal_workflow_id SET DEFAULT nextval('public.proposal_workflows_proposal_workflow_id_seq'::regclass);


--
-- TOC entry 3159 (class 2604 OID 16426)
-- Name: proposals proposal_pk; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals ALTER COLUMN proposal_pk SET DEFAULT nextval('public.proposals_proposal_id_seq'::regclass);


--
-- TOC entry 3269 (class 2604 OID 17438)
-- Name: question_dependencies question_dependency_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.question_dependencies ALTER COLUMN question_dependency_id SET DEFAULT nextval('public.question_dependencies_question_dependency_id_seq'::regclass);


--
-- TOC entry 3217 (class 2604 OID 17002)
-- Name: questionaries questionary_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questionaries ALTER COLUMN questionary_id SET DEFAULT nextval('public.questionaries_questionary_id_seq'::regclass);


--
-- TOC entry 3176 (class 2604 OID 16927)
-- Name: role_user role_user_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user ALTER COLUMN role_user_id SET DEFAULT nextval('public.role_user_role_user_id_seq'::regclass);


--
-- TOC entry 3175 (class 2604 OID 16541)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 3222 (class 2604 OID 17141)
-- Name: samples sample_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples ALTER COLUMN sample_id SET DEFAULT nextval('public.samples_sample_id_seq'::regclass);


--
-- TOC entry 3263 (class 2604 OID 17374)
-- Name: shipments shipment_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments ALTER COLUMN shipment_id SET DEFAULT nextval('public.shipments_shipment_id_seq'::regclass);


--
-- TOC entry 3231 (class 2604 OID 17258)
-- Name: status_changing_events status_changing_event_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.status_changing_events ALTER COLUMN status_changing_event_id SET DEFAULT nextval('public.next_status_events_next_status_event_id_seq'::regclass);


--
-- TOC entry 3202 (class 2604 OID 16732)
-- Name: technical_review technical_review_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.technical_review ALTER COLUMN technical_review_id SET DEFAULT nextval('public.technical_review_technical_review_id_seq'::regclass);


--
-- TOC entry 3216 (class 2604 OID 16994)
-- Name: template_categories template_category_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.template_categories ALTER COLUMN template_category_id SET DEFAULT nextval('public.template_categories_template_category_id_seq'::regclass);


--
-- TOC entry 3211 (class 2604 OID 16859)
-- Name: templates template_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates ALTER COLUMN template_id SET DEFAULT nextval('public.proposal_templates_template_id_seq'::regclass);


--
-- TOC entry 3213 (class 2604 OID 16895)
-- Name: templates_has_questions id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates_has_questions ALTER COLUMN id SET DEFAULT nextval('public.proposal_question__proposal_template__rels_id_seq'::regclass);


--
-- TOC entry 3167 (class 2604 OID 16453)
-- Name: topics topic_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topics ALTER COLUMN topic_id SET DEFAULT nextval('public.proposal_topics_topic_id_seq'::regclass);


--
-- TOC entry 3169 (class 2604 OID 16455)
-- Name: topics sort_order; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topics ALTER COLUMN sort_order SET DEFAULT nextval('public.proposal_topics_sort_order_seq'::regclass);


--
-- TOC entry 3272 (class 2604 OID 17488)
-- Name: units unit_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.units ALTER COLUMN unit_id SET DEFAULT nextval('public.units_unit_id_seq'::regclass);


--
-- TOC entry 3150 (class 2604 OID 16403)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3276 (class 2604 OID 17612)
-- Name: visits visit_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits ALTER COLUMN visit_id SET DEFAULT nextval('public.visitations_visitation_id_seq'::regclass);


--
-- TOC entry 3668 (class 0 OID 16776)
-- Dependencies: 235
-- Data for Name: SEP_Assignments; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3674 (class 0 OID 16961)
-- Dependencies: 241
-- Data for Name: SEP_Proposals; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3707 (class 0 OID 17508)
-- Dependencies: 274
-- Data for Name: SEP_Reviewers; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3647 (class 0 OID 16561)
-- Dependencies: 214
-- Data for Name: SEP_Reviews; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3708 (class 0 OID 17550)
-- Dependencies: 275
-- Data for Name: SEP_meeting_decisions; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3667 (class 0 OID 16766)
-- Dependencies: 234
-- Data for Name: SEPs; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public."SEPs" (sep_id, description, code, number_ratings_required, active, sep_chair_user_id, sep_secretary_user_id) VALUES (1, 'DEMAX scientific evaluation panel', 'DEMAX', 2, true, NULL, NULL);


--
-- TOC entry 3699 (class 0 OID 17405)
-- Dependencies: 266
-- Data for Name: active_templates; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3641 (class 0 OID 16483)
-- Dependencies: 208
-- Data for Name: answers; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3704 (class 0 OID 17470)
-- Dependencies: 271
-- Data for Name: api_permissions; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3651 (class 0 OID 16611)
-- Dependencies: 218
-- Data for Name: call; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.call (call_id, call_short_code, start_call, end_call, start_review, end_review, start_notify, end_notify, cycle_comment, survey_comment, template_id, start_cycle, end_cycle, proposal_workflow_id, call_ended, call_review_ended, start_sep_review, end_sep_review, call_sep_review_ended, reference_number_format, proposal_sequence, allocation_time_unit) VALUES (1, 'call 1', '2019-01-01 00:00:00+00', '2030-01-01 00:00:00+00', '2019-01-01 00:00:00+00', '2030-01-01 00:00:00+00', '2019-01-01 00:00:00+00', '2030-01-01 00:00:00+00', 'This is cycle comment', 'This is survey comment', 1, '2023-01-10 16:15:01.623901+00', '2023-01-10 16:15:01.623901+00', NULL, false, false, '2023-01-10 16:15:02.061127+00', '2023-01-10 16:15:02.061127+00', false, NULL, NULL, 'day');


--
-- TOC entry 3682 (class 0 OID 17084)
-- Dependencies: 249
-- Data for Name: call_has_instruments; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3661 (class 0 OID 16708)
-- Dependencies: 228
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.countries (country_id, country) VALUES (1, 'Afghanistan');
INSERT INTO public.countries (country_id, country) VALUES (2, 'Albania');
INSERT INTO public.countries (country_id, country) VALUES (3, 'Algeria');
INSERT INTO public.countries (country_id, country) VALUES (4, 'Andorra');
INSERT INTO public.countries (country_id, country) VALUES (5, 'Angola');
INSERT INTO public.countries (country_id, country) VALUES (6, 'Anguilla');
INSERT INTO public.countries (country_id, country) VALUES (7, 'Antigua & Barbuda');
INSERT INTO public.countries (country_id, country) VALUES (8, 'Argentina');
INSERT INTO public.countries (country_id, country) VALUES (9, 'Armenia');
INSERT INTO public.countries (country_id, country) VALUES (10, 'Australia');
INSERT INTO public.countries (country_id, country) VALUES (11, 'Austria');
INSERT INTO public.countries (country_id, country) VALUES (12, 'Azerbaijan');
INSERT INTO public.countries (country_id, country) VALUES (13, 'Bahamas');
INSERT INTO public.countries (country_id, country) VALUES (14, 'Bahrain');
INSERT INTO public.countries (country_id, country) VALUES (15, 'Bangladesh');
INSERT INTO public.countries (country_id, country) VALUES (16, 'Barbados');
INSERT INTO public.countries (country_id, country) VALUES (17, 'Belarus');
INSERT INTO public.countries (country_id, country) VALUES (18, 'Belgium');
INSERT INTO public.countries (country_id, country) VALUES (19, 'Belize');
INSERT INTO public.countries (country_id, country) VALUES (20, 'Benin');
INSERT INTO public.countries (country_id, country) VALUES (21, 'Bermuda');
INSERT INTO public.countries (country_id, country) VALUES (22, 'Bhutan');
INSERT INTO public.countries (country_id, country) VALUES (23, 'Bolivia');
INSERT INTO public.countries (country_id, country) VALUES (24, 'Bosnia & Herzegovina');
INSERT INTO public.countries (country_id, country) VALUES (25, 'Botswana');
INSERT INTO public.countries (country_id, country) VALUES (26, 'Brazil');
INSERT INTO public.countries (country_id, country) VALUES (27, 'Brunei Darussalam');
INSERT INTO public.countries (country_id, country) VALUES (28, 'Bulgaria');
INSERT INTO public.countries (country_id, country) VALUES (29, 'Burkina Faso');
INSERT INTO public.countries (country_id, country) VALUES (30, 'Burundi');
INSERT INTO public.countries (country_id, country) VALUES (31, 'Cambodia');
INSERT INTO public.countries (country_id, country) VALUES (32, 'Cameroon');
INSERT INTO public.countries (country_id, country) VALUES (33, 'Canada');
INSERT INTO public.countries (country_id, country) VALUES (34, 'Cape Verde');
INSERT INTO public.countries (country_id, country) VALUES (35, 'Cayman Islands');
INSERT INTO public.countries (country_id, country) VALUES (36, 'Central African Republic');
INSERT INTO public.countries (country_id, country) VALUES (37, 'Chad');
INSERT INTO public.countries (country_id, country) VALUES (38, 'Chile');
INSERT INTO public.countries (country_id, country) VALUES (39, 'China');
INSERT INTO public.countries (country_id, country) VALUES (40, 'China - Hong Kong / Macau');
INSERT INTO public.countries (country_id, country) VALUES (41, 'Colombia');
INSERT INTO public.countries (country_id, country) VALUES (42, 'Comoros');
INSERT INTO public.countries (country_id, country) VALUES (43, 'Congo');
INSERT INTO public.countries (country_id, country) VALUES (44, 'Congo, Democratic Republic of (DRC)');
INSERT INTO public.countries (country_id, country) VALUES (45, 'Costa Rica');
INSERT INTO public.countries (country_id, country) VALUES (46, 'Croatia');
INSERT INTO public.countries (country_id, country) VALUES (47, 'Cuba');
INSERT INTO public.countries (country_id, country) VALUES (48, 'Cyprus');
INSERT INTO public.countries (country_id, country) VALUES (49, 'Czech Republic');
INSERT INTO public.countries (country_id, country) VALUES (50, 'Denmark');
INSERT INTO public.countries (country_id, country) VALUES (51, 'Djibouti');
INSERT INTO public.countries (country_id, country) VALUES (52, 'Dominica');
INSERT INTO public.countries (country_id, country) VALUES (53, 'Dominican Republic');
INSERT INTO public.countries (country_id, country) VALUES (54, 'Ecuador');
INSERT INTO public.countries (country_id, country) VALUES (55, 'Egypt');
INSERT INTO public.countries (country_id, country) VALUES (56, 'El Salvador');
INSERT INTO public.countries (country_id, country) VALUES (57, 'Equatorial Guinea');
INSERT INTO public.countries (country_id, country) VALUES (58, 'Eritrea');
INSERT INTO public.countries (country_id, country) VALUES (59, 'Estonia');
INSERT INTO public.countries (country_id, country) VALUES (60, 'Eswatini');
INSERT INTO public.countries (country_id, country) VALUES (61, 'Ethiopia');
INSERT INTO public.countries (country_id, country) VALUES (62, 'Fiji');
INSERT INTO public.countries (country_id, country) VALUES (63, 'Finland');
INSERT INTO public.countries (country_id, country) VALUES (64, 'France');
INSERT INTO public.countries (country_id, country) VALUES (65, 'French Guiana');
INSERT INTO public.countries (country_id, country) VALUES (66, 'Gabon');
INSERT INTO public.countries (country_id, country) VALUES (67, 'Gambia, Republic of The');
INSERT INTO public.countries (country_id, country) VALUES (68, 'Georgia');
INSERT INTO public.countries (country_id, country) VALUES (69, 'Germany');
INSERT INTO public.countries (country_id, country) VALUES (70, 'Ghana');
INSERT INTO public.countries (country_id, country) VALUES (71, 'Great Britain');
INSERT INTO public.countries (country_id, country) VALUES (72, 'Greece');
INSERT INTO public.countries (country_id, country) VALUES (73, 'Grenada');
INSERT INTO public.countries (country_id, country) VALUES (74, 'Guadeloupe');
INSERT INTO public.countries (country_id, country) VALUES (75, 'Guatemala');
INSERT INTO public.countries (country_id, country) VALUES (76, 'Guinea');
INSERT INTO public.countries (country_id, country) VALUES (77, 'Guinea-Bissau');
INSERT INTO public.countries (country_id, country) VALUES (78, 'Guyana');
INSERT INTO public.countries (country_id, country) VALUES (79, 'Haiti');
INSERT INTO public.countries (country_id, country) VALUES (80, 'Honduras');
INSERT INTO public.countries (country_id, country) VALUES (81, 'Hungary');
INSERT INTO public.countries (country_id, country) VALUES (82, 'Iceland');
INSERT INTO public.countries (country_id, country) VALUES (83, 'India');
INSERT INTO public.countries (country_id, country) VALUES (84, 'Indonesia');
INSERT INTO public.countries (country_id, country) VALUES (85, 'Iran');
INSERT INTO public.countries (country_id, country) VALUES (86, 'Iraq');
INSERT INTO public.countries (country_id, country) VALUES (87, 'Israel and the Occupied Territories');
INSERT INTO public.countries (country_id, country) VALUES (88, 'Italy');
INSERT INTO public.countries (country_id, country) VALUES (89, 'Ivory Coast');
INSERT INTO public.countries (country_id, country) VALUES (90, 'Jamaica');
INSERT INTO public.countries (country_id, country) VALUES (91, 'Japan');
INSERT INTO public.countries (country_id, country) VALUES (92, 'Jordan');
INSERT INTO public.countries (country_id, country) VALUES (93, 'Kazakhstan');
INSERT INTO public.countries (country_id, country) VALUES (94, 'Kenya');
INSERT INTO public.countries (country_id, country) VALUES (95, 'Korea, Democratic Republic of (North Korea)');
INSERT INTO public.countries (country_id, country) VALUES (96, 'Korea, Republic of (South Korea)');
INSERT INTO public.countries (country_id, country) VALUES (97, 'Kosovo');
INSERT INTO public.countries (country_id, country) VALUES (98, 'Kuwait');
INSERT INTO public.countries (country_id, country) VALUES (99, 'Kyrgyz Republic (Kyrgyzstan)');
INSERT INTO public.countries (country_id, country) VALUES (100, 'Laos');
INSERT INTO public.countries (country_id, country) VALUES (101, 'Latvia');
INSERT INTO public.countries (country_id, country) VALUES (102, 'Lebanon');
INSERT INTO public.countries (country_id, country) VALUES (103, 'Lesotho');
INSERT INTO public.countries (country_id, country) VALUES (104, 'Liberia');
INSERT INTO public.countries (country_id, country) VALUES (105, 'Libya');
INSERT INTO public.countries (country_id, country) VALUES (106, 'Liechtenstein');
INSERT INTO public.countries (country_id, country) VALUES (107, 'Lithuania');
INSERT INTO public.countries (country_id, country) VALUES (108, 'Luxembourg');
INSERT INTO public.countries (country_id, country) VALUES (109, 'Madagascar');
INSERT INTO public.countries (country_id, country) VALUES (110, 'Malawi');
INSERT INTO public.countries (country_id, country) VALUES (111, 'Malaysia');
INSERT INTO public.countries (country_id, country) VALUES (112, 'Maldives');
INSERT INTO public.countries (country_id, country) VALUES (113, 'Mali');
INSERT INTO public.countries (country_id, country) VALUES (114, 'Malta');
INSERT INTO public.countries (country_id, country) VALUES (115, 'Martinique');
INSERT INTO public.countries (country_id, country) VALUES (116, 'Mauritania');
INSERT INTO public.countries (country_id, country) VALUES (117, 'Mauritius');
INSERT INTO public.countries (country_id, country) VALUES (118, 'Mayotte');
INSERT INTO public.countries (country_id, country) VALUES (119, 'Mexico');
INSERT INTO public.countries (country_id, country) VALUES (120, 'Moldova, Republic of');
INSERT INTO public.countries (country_id, country) VALUES (121, 'Monaco');
INSERT INTO public.countries (country_id, country) VALUES (122, 'Mongolia');
INSERT INTO public.countries (country_id, country) VALUES (123, 'Montenegro');
INSERT INTO public.countries (country_id, country) VALUES (124, 'Montserrat');
INSERT INTO public.countries (country_id, country) VALUES (125, 'Morocco');
INSERT INTO public.countries (country_id, country) VALUES (126, 'Mozambique');
INSERT INTO public.countries (country_id, country) VALUES (127, 'Myanmar/Burma');
INSERT INTO public.countries (country_id, country) VALUES (128, 'Namibia');
INSERT INTO public.countries (country_id, country) VALUES (129, 'Nepal');
INSERT INTO public.countries (country_id, country) VALUES (130, 'New Zealand');
INSERT INTO public.countries (country_id, country) VALUES (131, 'Nicaragua');
INSERT INTO public.countries (country_id, country) VALUES (132, 'Niger');
INSERT INTO public.countries (country_id, country) VALUES (133, 'Nigeria');
INSERT INTO public.countries (country_id, country) VALUES (134, 'North Macedonia, Republic of');
INSERT INTO public.countries (country_id, country) VALUES (135, 'Norway');
INSERT INTO public.countries (country_id, country) VALUES (136, 'Oman');
INSERT INTO public.countries (country_id, country) VALUES (137, 'Pacific Islands');
INSERT INTO public.countries (country_id, country) VALUES (138, 'Pakistan');
INSERT INTO public.countries (country_id, country) VALUES (139, 'Panama');
INSERT INTO public.countries (country_id, country) VALUES (140, 'Papua New Guinea');
INSERT INTO public.countries (country_id, country) VALUES (141, 'Paraguay');
INSERT INTO public.countries (country_id, country) VALUES (142, 'Peru');
INSERT INTO public.countries (country_id, country) VALUES (143, 'Philippines');
INSERT INTO public.countries (country_id, country) VALUES (144, 'Poland');
INSERT INTO public.countries (country_id, country) VALUES (145, 'Portugal');
INSERT INTO public.countries (country_id, country) VALUES (146, 'Puerto Rico');
INSERT INTO public.countries (country_id, country) VALUES (147, 'Qatar');
INSERT INTO public.countries (country_id, country) VALUES (148, 'Reunion');
INSERT INTO public.countries (country_id, country) VALUES (149, 'Romania');
INSERT INTO public.countries (country_id, country) VALUES (150, 'Russian Federation');
INSERT INTO public.countries (country_id, country) VALUES (151, 'Rwanda');
INSERT INTO public.countries (country_id, country) VALUES (152, 'Saint Kitts and Nevis');
INSERT INTO public.countries (country_id, country) VALUES (153, 'Saint Lucia');
INSERT INTO public.countries (country_id, country) VALUES (154, 'Saint Vincent and the Grenadines');
INSERT INTO public.countries (country_id, country) VALUES (155, 'Samoa');
INSERT INTO public.countries (country_id, country) VALUES (156, 'Sao Tome and Principe');
INSERT INTO public.countries (country_id, country) VALUES (157, 'Saudi Arabia');
INSERT INTO public.countries (country_id, country) VALUES (158, 'Senegal');
INSERT INTO public.countries (country_id, country) VALUES (159, 'Serbia');
INSERT INTO public.countries (country_id, country) VALUES (160, 'Seychelles');
INSERT INTO public.countries (country_id, country) VALUES (161, 'Sierra Leone');
INSERT INTO public.countries (country_id, country) VALUES (162, 'Singapore');
INSERT INTO public.countries (country_id, country) VALUES (163, 'Slovak Republic (Slovakia)');
INSERT INTO public.countries (country_id, country) VALUES (164, 'Slovenia');
INSERT INTO public.countries (country_id, country) VALUES (165, 'Solomon Islands');
INSERT INTO public.countries (country_id, country) VALUES (166, 'Somalia');
INSERT INTO public.countries (country_id, country) VALUES (167, 'South Africa');
INSERT INTO public.countries (country_id, country) VALUES (168, 'South Sudan');
INSERT INTO public.countries (country_id, country) VALUES (169, 'Spain');
INSERT INTO public.countries (country_id, country) VALUES (170, 'Sri Lanka');
INSERT INTO public.countries (country_id, country) VALUES (171, 'Sudan');
INSERT INTO public.countries (country_id, country) VALUES (172, 'Suriname');
INSERT INTO public.countries (country_id, country) VALUES (173, 'Sweden');
INSERT INTO public.countries (country_id, country) VALUES (174, 'Switzerland');
INSERT INTO public.countries (country_id, country) VALUES (175, 'Syria');
INSERT INTO public.countries (country_id, country) VALUES (176, 'Tajikistan');
INSERT INTO public.countries (country_id, country) VALUES (177, 'Tanzania');
INSERT INTO public.countries (country_id, country) VALUES (178, 'Thailand');
INSERT INTO public.countries (country_id, country) VALUES (179, 'Netherlands');
INSERT INTO public.countries (country_id, country) VALUES (180, 'Timor Leste');
INSERT INTO public.countries (country_id, country) VALUES (181, 'Togo');
INSERT INTO public.countries (country_id, country) VALUES (182, 'Trinidad & Tobago');
INSERT INTO public.countries (country_id, country) VALUES (183, 'Tunisia');
INSERT INTO public.countries (country_id, country) VALUES (184, 'Turkey');
INSERT INTO public.countries (country_id, country) VALUES (185, 'Turkmenistan');
INSERT INTO public.countries (country_id, country) VALUES (186, 'Turks & Caicos Islands');
INSERT INTO public.countries (country_id, country) VALUES (187, 'Uganda');
INSERT INTO public.countries (country_id, country) VALUES (188, 'Ukraine');
INSERT INTO public.countries (country_id, country) VALUES (189, 'United Arab Emirates');
INSERT INTO public.countries (country_id, country) VALUES (190, 'United States of America (USA)');
INSERT INTO public.countries (country_id, country) VALUES (191, 'Uruguay');
INSERT INTO public.countries (country_id, country) VALUES (192, 'Uzbekistan');
INSERT INTO public.countries (country_id, country) VALUES (193, 'Venezuela');
INSERT INTO public.countries (country_id, country) VALUES (194, 'Vietnam');
INSERT INTO public.countries (country_id, country) VALUES (195, 'Virgin Islands (UK)');
INSERT INTO public.countries (country_id, country) VALUES (196, 'Virgin Islands (US)');
INSERT INTO public.countries (country_id, country) VALUES (197, 'Yemen');
INSERT INTO public.countries (country_id, country) VALUES (198, 'Zambia');
INSERT INTO public.countries (country_id, country) VALUES (199, 'Zimbabwe');


--
-- TOC entry 3630 (class 0 OID 16385)
-- Dependencies: 197
-- Data for Name: db_patches; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateTopicReadinessState.sql', 'jekabskarklins', 'Adding new table for keeping track which steps have been finished when submitting proposal', '2019-10-17 00:00:00+00', '2023-01-10 16:15:00.515369+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposals.sql', 'jekabskarklins', 'Implementing proposal shortcode', '2019-10-17 00:00:00+00', '2023-01-10 16:15:00.538696+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalUser.sql', 'jekabskarklins', 'Implementing deleting proposal', '2019-10-17 00:00:00+00', '2023-01-10 16:15:00.58017+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalQuestions.sql', 'jekabskarklins', 'BUGFIX can''t save large enbellishments', '2019-10-17 00:00:00+00', '2023-01-10 16:15:00.598205+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalAnswer.sql', 'jekabskarklins', 'BUGFIX can''t save long answers', '2019-11-06 00:00:00+00', '2023-01-10 16:15:00.60913+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalQuestionDependencies.sql', 'jekabskarklins', 'BUGFIX can''t save long dependencies', '2019-11-11 00:00:00+00', '2023-01-10 16:15:00.621359+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterUsers.sql', 'fredrikbolmsten', 'Make user fields longer', '2019-11-14 00:00:00+00', '2023-01-10 16:15:00.639095+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddPrivacyCookiePages.sql', 'fredrikbolmsten', 'Adding new pages', '2019-11-14 00:00:00+00', '2023-01-10 16:15:00.658734+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddNationalitiesTable.sql', 'fredrikbolmsten', 'Adding new table for nationalities', '2019-11-19 00:00:00+00', '2023-01-10 16:15:00.673181+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddInstitutionTable.sql', 'fredrikbolmsten', 'Adding new table for institution', '2019-11-19 00:00:00+00', '2023-01-10 16:15:00.713459+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddCountryTable.sql', 'fredrikbolmsten', 'Adding new table for countries ', '2019-11-19 00:00:00+00', '2023-01-10 16:15:00.767116+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ChangeUserTable.sql', 'fredrikbolmsten', 'link new columns to user table', '2019-11-26 00:00:00+00', '2023-01-10 16:15:00.79626+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('MigrateUsers.sql', 'fredrikbolmsten', 'Setting nationality and organisation for users', '2019-11-26 00:00:00+00', '2023-01-10 16:15:00.808644+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterUsersEmailInvite.sql', 'fredrikbolmsten', 'Adding column for accounts created by invite', '2019-11-28 00:00:00+00', '2023-01-10 16:15:00.821046+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterUserGenderLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-10 00:00:00+00', '2023-01-10 16:15:00.835155+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterUserTitleLength.sql', 'fredrikbolmsten', 'Make user title longer', '2019-12-10 00:00:00+00', '2023-01-10 16:15:00.850101+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalTitleAbstractLen.sql', 'fredrikbolmsten', 'Make proposal title longer', '2019-12-10 00:00:00+00', '2023-01-10 16:15:00.867198+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalNewFields.sql', 'fredrikbolmsten', 'Adding new columns for proposals', '2020-02-16 00:00:00+00', '2023-01-10 16:15:00.881627+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddTechnicalReviewTable.sql', 'fredrikbolmsten', 'Adding new table for technical review ', '2020-01-24 00:00:00+00', '2023-01-10 16:15:00.895389+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalQuestion.sql', 'jekabskarklins', 'Adding column nid (natural id)', '2020-02-24 00:00:00+00', '2023-01-10 16:15:00.926898+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddEventLogsTable.sql', 'martintrajanovski', ' Adding new table for storing events.', '2020-03-04 00:00:00+00', '2023-01-10 16:15:00.943056+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddReviewPage.sql', 'Fredrik Bolmsten', 'Add new row for reviewpage text', '2020-03-18 00:00:00+00', '2023-01-10 16:15:00.965356+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSEPsTables.sql', 'martintrajanovski', 'Logging', '2020-03-29 00:00:00+00', '2023-01-10 16:15:00.976098+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddExternalCommentTechRev.sql', 'fredrikbolmsten', 'Logging', '2020-04-01 00:00:00+00', '2023-01-10 16:15:01.034249+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterRoleUser.sql', 'fredrikbolmsten', 'Delete user', '2020-04-02 00:00:00+00', '2023-01-10 16:15:01.047591+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterEventLog.sql', 'fredrikbolmsten', 'Delete row on user removal', '2020-04-20 00:00:00+00', '2023-01-10 16:15:01.063485+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('Create_proposal_templates_table.sql', 'jekabskarklins', 'Creating questionaries table', '2020-03-30 00:00:00+00', '2023-01-10 16:15:01.079149+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('Alter_proposal_question_dependencies.sql', 'jekabskarklins', 'Adding more fields for proposal template versioning', '2020-03-30 00:00:00+00', '2023-01-10 16:15:01.105231+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('Alter_calls.sql', 'jekabskarklins', 'Adding template id to call', '2020-03-30 00:00:00+00', '2023-01-10 16:15:01.124449+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateQuestionsTemplateRelationTable.sql', 'jekabskarklins', 'Create table proposal_question__proposal_template__rels, and migrate data from proposal_question_dependencies', '2020-04-08 00:00:00+00', '2023-01-10 16:15:01.136344+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterSEPAssgnments.sql', 'martintrajanovski', 'Change of primary key in SEP Assignments', '2020-05-05 00:00:00+00', '2023-01-10 16:15:01.167997+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterRoleUserTable.sql', 'martintrajanovski', 'Change of primary key in role_user', '2020-05-12 00:00:00+00', '2023-01-10 16:15:01.184183+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddConfigToQuestionRelsTable.sql', 'jekabskarklins', 'Adding config override column', '2020-05-12 00:00:00+00', '2023-01-10 16:15:01.211083+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalAddComments.sql', 'fredrikbolmsten', 'Adding more fields for proposal', '2020-05-12 00:00:00+00', '2023-01-10 16:15:01.223845+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterCallsDateFormats.sql', 'martintrajanovski', 'Change of date fields type timestamp', '2020-05-14 00:00:00+00', '2023-01-10 16:15:01.234896+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalAddNotified.sql', 'fredrikbolmsten', 'Adding notified field for proposal', '2020-05-19 00:00:00+00', '2023-01-10 16:15:01.285525+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateSEPProposals.sql', 'martintrajanovski', 'Create SEP proposals table and modify SEP assignments', '2020-05-20 00:00:00+00', '2023-01-10 16:15:01.302035+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterReviewsTable.sql', 'martintrajanovski', 'Change the name to SEP_Reviews and add some columns', '2020-06-03 00:00:00+00', '2023-01-10 16:15:01.328898+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterProposalTopicsDeleteOnCascade.sql', 'jekabskarklins', 'Delete topics when template is deleted', '2020-05-13 00:00:00+00', '2023-01-10 16:15:01.345456+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('UpdateTableNamingConventions.sql', 'jekabskarklins', 'Updating database naming conventions for generic templates', '2020-05-26 00:00:00+00', '2023-01-10 16:15:01.359048+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterTemplatesAddColumCategory.sql', 'jekabskarklins', 'Adding category ID to templates', '2020-06-09 00:00:00+00', '2023-01-10 16:15:01.407193+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateIndexesForTemplates.sql', 'jekabskarklins', 'Adding indexes for performance', '2020-05-28 00:00:00+00', '2023-01-10 16:15:01.423862+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterQuestionsAddColumnCategory.sql', 'jekabskarklins', 'Adding category ID to questions', '2020-06-11 00:00:00+00', '2023-01-10 16:15:01.461397+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSubTemplateQuestionType.sql', 'jekabskarklins', 'Adding new question type', '2020-06-11 00:00:00+00', '2023-01-10 16:15:01.477441+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('MigrateReviewsData.sql', 'martintrajanovski', 'Migrate existing reviews to new structure', '2020-06-09 00:00:00+00', '2023-01-10 16:15:01.491173+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateInstruments.sql', 'martintrajanovski', 'Create instruments and call_has_instrument tables', '2020-06-12 00:00:00+00', '2023-01-10 16:15:01.507148+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('InstrumentHasProposals.sql', 'martintrajanovski', 'instrument_has_proposals table creation', '2020-06-23 00:00:00+00', '2023-01-10 16:15:01.548042+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterQuestionariesAddCreator.sql', 'jekabskarklins', 'Add creator column to questionaries', '2020-06-23 00:00:00+00', '2023-01-10 16:15:01.569632+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('InstrumentHasScientists.sql', 'martintrajanovski', 'instrument_has_scientists table creation', '2020-06-26 00:00:00+00', '2023-01-10 16:15:01.587771+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterCallHasInstrument.sql', 'martintrajanovski', 'Add availability_time to call_has_instruments', '2020-06-30 00:00:00+00', '2023-01-10 16:15:01.611146+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddCycleDatesInCall.sql', 'martintrajanovski', 'Add start_cycle and end_cycle in call', '2020-07-02 00:00:00+00', '2023-01-10 16:15:01.623901+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateSamplesTable.sql', 'jekabskarklins', 'Create samples table', '2020-07-14 00:00:00+00', '2023-01-10 16:15:01.636373+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddCallIdInSEPProposals.sql', 'martintrajanovski', 'Add call_id in SEP_Proposals', '2020-07-16 00:00:00+00', '2023-01-10 16:15:01.66356+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddUniqueConstraintToQuestionaryId.sql', 'jekabskarklins', 'Unique constraint', '2020-07-29 00:00:00+00', '2023-01-10 16:15:01.676606+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddViewForProposalTable.sql', 'fredrikbolmsten', 'Add new view for proposal table', '2020-07-29 00:00:00+00', '2023-01-10 16:15:01.692867+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSampleSafetyReviewerRole.sql', 'jekabskarklins', 'Add sample safety reviewer role', '2020-07-24 00:00:00+00', '2023-01-10 16:15:01.711614+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ConvertDependencyConditionToJsonb.sql', 'jekabskarklins', 'Convert field dependency to JSONB', '2020-08-04 00:00:00+00', '2023-01-10 16:15:01.722358+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterAnswerHasQuestionariesCascadeOnDelete.sql', 'jekabskarklins', 'Delete entries when answer is deleted', '2020-05-13 00:00:00+00', '2023-01-10 16:15:01.752989+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddInstrumentSubmittedToCallHasInstruments.sql', 'martintrajanovski', 'Add submitted flag in call_has_instruments', '2020-08-26 00:00:00+00', '2023-01-10 16:15:01.766609+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ConvertAnswerToJsonb.sql', 'jekabskarklins', 'Convert answer to JSONB', '2020-08-31 00:00:00+00', '2023-01-10 16:15:01.777478+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterSamplesAddComment.sql', 'jekabskarklins', 'Add new column comment', '2020-09-08 00:00:00+00', '2023-01-10 16:15:01.824938+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalStatusesTable.sql', 'martintrajanovski', 'Add proposals statuses table', '2020-09-09 00:00:00+00', '2023-01-10 16:15:01.842342+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalWorkflows.sql', 'martintrajanovski', 'Add proposals workflows and connections tables', '2020-09-14 00:00:00+00', '2023-01-10 16:15:01.861873+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ConvertFileUploadAnswerValueFormat.sql', 'jekabskarklins', 'Convert file upload answer value format', '2020-09-15 00:00:00+00', '2023-01-10 16:15:01.886517+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSubmittedFlagToProposalsAndAddStatusConstraint.sql', 'martintrajanovski', 'Add submitted flag to proposals table and add status constraint', '2020-09-15 00:00:00+00', '2023-01-10 16:15:01.898707+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ReCreateProposalsView.sql', 'martintrajanovski', 'Re-create proposals view after changes in proposal.', '2020-09-15 00:00:00+00', '2023-01-10 16:15:01.912123+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSortOrderToProposalWorkflowConnections.sql', 'martintrajanovski', 'Add sort_order field to be able to sort the connections easier', '2020-09-24 00:00:00+00', '2023-01-10 16:15:01.935675+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddDroppableGroupIdToProposalWorkflowConnections.sql', 'martintrajanovski', 'Add droppable_group_id field to be able to group the connections easier', '2020-09-30 00:00:00+00', '2023-01-10 16:15:01.948363+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddingNewQuestionDataType', 'jekabskarklins', 'Insert SAMPLE_BASIS question data type', '2020-10-01 00:00:00+00', '2023-01-10 16:15:01.961001+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreatingSampleBasisQuestion', 'jekabskarklins', 'Create sample basis special question', '2020-10-05 00:00:00+00', '2023-01-10 16:15:01.97195+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddNextStatusEvents.sql', 'martintrajanovski', 'Add proposal workflow next status events table.', '2020-10-16 00:00:00+00', '2023-01-10 16:15:01.987527+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalWorkflowToCall.sql', 'martintrajanovski', 'Add proposal_workflow_id to call table', '2020-10-09 00:00:00+00', '2023-01-10 16:15:02.012344+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalEvents.sql', 'martintrajanovski', 'Add proposal events table to keep track of all fired events on a proposal.', '2020-10-22 00:00:00+00', '2023-01-10 16:15:02.024809+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('0068_ConvertSubtemplateToSampleDeclaration.sql', 'jekabskarklins', 'Convert Subtemplate To Sample Declaration', '2020-10-28 00:00:00+00', '2023-01-10 16:15:02.045368+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddCallEndedFlagToCalls.sql', 'martintrajanovski', 'Add call_ended flag to calls', '2020-10-30 00:00:00+00', '2023-01-10 16:15:02.061127+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalIdToSamples.sql', 'jekabskarklins', 'Adding columns proposal_id and question_id to samples', '2020-10-22 00:00:00+00', '2023-01-10 16:15:02.076806+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddIntervalDataType.sql', 'jekabskarklins', 'Adding new question type', '2020-10-30 00:00:00+00', '2023-01-10 16:15:02.095313+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddMoreEventsToProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2020-11-02 00:00:00+00', '2023-01-10 16:15:02.107926+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalSampleSafeEventToProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2020-11-17 00:00:00+00', '2023-01-10 16:15:02.12212+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ConvertSelectFromOptionsAnswer.sql', 'jekabskarklins', 'Convert SelectFromOptions answer to array', '2020-11-13 00:00:00+00', '2023-01-10 16:15:02.134738+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalStatusShortCodeAndIsDefaultFlag.sql', 'martintrajanovski', 'Change proposal statuses table', '2020-09-09 00:00:00+00', '2023-01-10 16:15:02.146739+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ExtendMimeTypeField.sql', 'jekabskarklins', 'Extends mime type field length', '2020-11-23 00:00:00+00', '2023-01-10 16:15:02.165508+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CleanupIncompleteSanples.sql', 'jekabskarklins', 'Clean up incomplete samples and make proposal_id, question_id required', '2020-11-26 00:00:00+00', '2023-01-10 16:15:02.175924+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('UpdateProposalView.sql', 'Peter Asztalos', 'Use SEP_Proposals for joining SEP', '2020-11-25 00:00:00+00', '2023-01-10 16:15:02.187359+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('MigrateFileIdsToUUID.sql', 'jekabskarklins', 'Migrate files to file_id:UUID instead of file_id::BIGINT', '2020-11-27 00:00:00+00', '2023-01-10 16:15:02.206273+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddInstrumentSubmittedToInstrumentHasProposals.sql', 'martintrajanovski', 'Add submitted flag in instrument_has_proposals', '2021-01-18 00:00:00+00', '2023-01-10 16:15:02.262565+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddMulticolumnIndexToSamples.sql', 'Peter Asztalos', 'Add Multicolumn Index To Samples', '2021-01-11 00:00:00+00', '2023-01-10 16:15:02.275599+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddNumberInputDataType.sql', 'fredrikbolmsten', 'Adding new question type', '2021-01-04 00:00:00+00', '2023-01-10 16:15:02.292909+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateShipmentsTable.sql', 'jekabskarklins', 'Create shipments table', '2021-01-11 00:00:00+00', '2023-01-10 16:15:02.303951+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddQuestionDependencies.sql', 'martintrajanovski', 'Store question dependencies in their own table so we can have multiple dependencies on one question.', '2021-01-12 00:00:00+00', '2023-01-10 16:15:02.34351+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterSEPProposalAllocatedTime.sql', 'Peter Asztalos', 'Alter SEP_Proposals, add SEP allocated time', '2021-01-15 00:00:00+00', '2023-01-10 16:15:02.372557+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateFeatureToggle.sql', 'jekabskarklins', 'Create Feature Toggle', '2021-01-13 00:00:00+00', '2023-01-10 16:15:02.386368+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddDependenciesOperator.sql', 'martintrajanovski', 'Question dependencies logic operator.', '2021-01-12 00:00:00+00', '2023-01-10 16:15:02.411278+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddApiPermissions.sql', 'martintrajanovski', 'Api permissions to be able to control the access to the api', '2021-01-26 00:00:00+00', '2023-01-10 16:15:02.424436+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddQuestionaryIdToProposalView.sql', 'Jekabs Karklins', 'Add questionary id to view', '2021-02-03 00:00:00+00', '2023-01-10 16:15:02.44779+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddRichTextInputDataType.sql', 'Peter Asztalos', 'Add Rich Text Input Data type', '2021-02-02 00:00:00+00', '2023-01-10 16:15:02.466767+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddUnits.sql', 'fredrikbolmsten', 'Adding units', '2021-02-02 00:00:00+00', '2023-01-10 16:15:02.477899+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddMissingPrimaryKeys.sql', 'Peter Asztalos', 'Add missing Primary keys', '2021-02-11 00:00:00+00', '2023-01-10 16:15:02.496424+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('MigrateFileUploadAnswers.sql', 'martintrajanovski', 'Migrate file_upload answers to support new structure with captions', '2021-02-05 00:00:00+00', '2023-01-10 16:15:02.549156+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('RemoveTimeFromDateAnswers.sql', 'jekabskarklins', 'Removing time from date answers, so exact date lookups can be made', '2021-02-12 00:00:00+00', '2023-01-10 16:15:02.567943+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddTechnicalReviewSubmittedFlag.sql', 'martintrajanovski', 'Add submitted flag in technical_review', '2020-02-10 00:00:00+00', '2023-01-10 16:15:02.585369+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('UpdateSepRelatedTables.sql', 'Peter Asztalos', 'Refactors how we store sep and user connections', '2021-02-15 00:00:00+00', '2023-01-10 16:15:02.599313+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AlterInstrumentHasProposalTable.sql', 'Peter Asztalos', 'Alter instrument_has_proposal table so deleting a proposal will cascade delete', '2021-02-15 00:00:00+00', '2023-01-10 16:15:02.636254+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddMissingProposalEvents.sql', 'martintrajanovski', 'Add more events to proposal_events', '2021-02-24 00:00:00+00', '2023-01-10 16:15:02.655089+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddFeasibilityReviewUpdatedProposalEvent.sql', 'martintrajanovski', 'Add more events to proposal_events', '2021-03-04 00:00:00+00', '2023-01-10 16:15:02.676842+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddManagementTimeAllocationAndManagementDecisionSubmittedFlag.sql', 'martintrajanovski', 'Add management time allocation and management decision submitted flag', '2021-03-10 00:00:00+00', '2023-01-10 16:15:02.696576+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSchedulerFeatureId.sql', 'Peter Asztalos', 'Add Scheduler FeatureId', '2021-03-08 00:00:00+00', '2023-01-10 16:15:02.716065+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddMoreProposalEventsAndChangeNextStatusEventsTable.sql', 'martintrajanovski', 'Add proposal_unfeasible event, change next_status_event table name and migrate data', '2021-03-17 00:00:00+00', '2023-01-10 16:15:02.729657+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('Insert_Into_Proposal_Statuses_Table.sql', 'David Symons', 'Add additional Status into Proposal Statuses table', '2021-03-19 00:00:00+00', '2023-01-10 16:15:02.753876+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalStatusUpdatedEvent.sql', 'martintrajanovski', 'Add proposal_status_updated event', '2021-03-19 00:00:00+00', '2023-01-10 16:15:02.767302+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddCallReferenceNumber.sql', 'simonfernandes', 'stfc-user-office-project#5 - Add proposal reference numbers.', '2021-02-04 00:00:00+00', '2023-01-10 16:15:02.780531+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSepMeetingDecisionTable.sql', 'martintrajanovski', 'Add SEP Meeting decision table to separate data from SEP meeting decision form.', '2021-03-19 00:00:00+00', '2023-01-10 16:15:02.794788+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalSequence.sql', 'simonfernandes', 'stfc-user-office-project#5 - Add proposal reference numbers.', '2021-02-26 00:00:00+00', '2023-01-10 16:15:02.821838+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ChangeRankingInProposalViewTable.sql', 'martintrajanovski', 'Rank order from SEP_meeting_decisions', '2021-03-23 00:00:00+00', '2023-01-10 16:15:02.852683+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('MigrateProposalsRankingToSepMeetingDecisions.sql', 'martintrajanovski', 'Migrate proposals to sep meeting decisions fields', '2021-03-23 00:00:00+00', '2023-01-10 16:15:02.875643+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalSepMeetingReorderedEvent.sql', 'martintrajanovski', 'Add proposal_sep_meeting_reorder event', '2021-04-06 00:00:00+00', '2023-01-10 16:15:02.890291+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CleanupAfterProposalDelete.sql', 'jekabskarklins', 'Clean up data when deleting proposal', '2021-04-27 00:00:00+00', '2023-01-10 16:15:02.904167+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('CreateSettings.sql', 'Alberto Popescu', 'Create Settings', '2021-03-25 00:00:00+00', '2023-01-10 16:15:02.917759+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddBeamlineManagerToInstrumentsTable.sql', 'jekabskarklins', 'Add responsible person named Beamline manager for each instrument', '2021-04-28 00:00:00+00', '2023-01-10 16:15:02.941686+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddVisitationTemplate.sql', 'jekabskarklins', 'Add visitation template', '2021-05-11 00:00:00+00', '2023-01-10 16:15:02.956124+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('SetAuthFeature.sql', 'Will Edwards', 'Set STFC auth to enabled', '2021-02-23 00:00:00+00', '2023-01-10 16:15:02.9832+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddTechnicalReviewAssigneeColumn.sql', 'jekabskarklins', 'Add technical reviewer assignee to instrument_has_proposals table', '2021-04-29 00:00:00+00', '2023-01-10 16:15:02.995685+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddReviewerIdToReviewsTable.sql', 'jekabskarklins', 'Add technical reviewer id reviews table', '2021-05-04 00:00:00+00', '2023-01-10 16:15:03.010805+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddSepIdInProposalViewTable..sql', 'martintrajanovski', 'Add sep id to the proposal view table', '2021-05-27 00:00:00+00', '2023-01-10 16:15:03.025822+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('SetAuthFeatureFalse.sql', 'jekabskarklins', 'Set STFC auth to disabled', '2021-06-03 00:00:00+00', '2023-01-10 16:15:03.056324+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddAllocationTimeUnitToCallTable.sql', 'martintrajanovski', 'Add proposal allocation time unit to call table', '2021-05-31 00:00:00+00', '2023-01-10 16:15:03.090413+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('RenameVisitationToVisit.sql', 'jekabskarklins', 'Improve naming', '2021-06-07 00:00:00+00', '2023-01-10 16:15:03.120205+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddAllocationTimeUnitToProposalViewTable.sql', 'martintrajanovski', 'Add proposal allocation time unit to proposal_view_table', '2021-05-31 00:00:00+00', '2023-01-10 16:15:03.172958+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddFooterPageContent.sql', 'Simon Fernandes', 'Add footer content to pagetext table', '2021-06-09 00:00:00+00', '2023-01-10 16:15:03.211019+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('MakeAllRolesShortCodesConsistent.sql', 'martintrajanovski', 'Make all role short codes lowercase and consistent', '2021-06-14 00:00:00+00', '2023-01-10 16:15:03.229766+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('RenameProposalIdToProposalPk.sql', 'jekabskarklins', 'Rename proposal id to proposal_pk', '2021-06-14 00:00:00+00', '2023-01-10 16:15:03.244745+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddProposalReservedEvent.sql', 'martintrajanovski', 'Add proposal_reserved to proposal_events', '2021-07-05 00:00:00+00', '2023-01-10 16:15:03.265788+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('ExperimentPreparationAlterings.sql', 'jekabskarklins', 'Add column scheduled_event_id to visits table', '2021-06-02 00:00:00+00', '2023-01-10 16:15:03.286731+00');
INSERT INTO public.db_patches (patch_id, author, purpose, created_at, applied_at) VALUES ('AddThemeVariablesToSettings.sql', 'Simon Fernandes', 'Add theme variables to settings', '2021-07-08 00:00:00+00', '2023-01-10 16:15:03.332526+00');


--
-- TOC entry 3665 (class 0 OID 16749)
-- Dependencies: 232
-- Data for Name: event_logs; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3703 (class 0 OID 17459)
-- Dependencies: 270
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.features (feature_id, is_enabled, description) VALUES ('EXTERNAL_AUTH', false, 'STFC Authentication');
INSERT INTO public.features (feature_id, is_enabled, description) VALUES ('SHIPPING', true, 'Shipping feature');
INSERT INTO public.features (feature_id, is_enabled, description) VALUES ('SCHEDULER', true, 'Scheduler feature');


--
-- TOC entry 3696 (class 0 OID 17355)
-- Dependencies: 263
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3659 (class 0 OID 16698)
-- Dependencies: 226
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.institutions (institution_id, institution, verified) VALUES (1, 'Other', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (2, 'A.A Baikov Institute of Metallurgy and Materials Science', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (3, 'ALBA Synchrotron Light Source', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (4, 'AGH University of Science and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (5, 'Aarhus University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (6, 'Aberystwyth University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (7, 'Adam Mickiewicz University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (8, 'Agricultural University of Athens', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (9, 'Aix-Marseille Université', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (10, 'Aristotle University of Thessaloniki', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (11, 'Arizona State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (12, 'Akdeniz University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (13, 'Australian Synchrotron', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (14, 'Atomic Energy Authority of Egypt, Nuclear Research Center', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (15, 'BAM Federal Institute for Materials Research and Testing', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (16, 'Beijing University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (17, 'Bergische Universität Wuppertal', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (18, 'Bielefeld University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (19, 'Ben-Gurion University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (20, 'Blekinge Institute of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (21, 'Boreskov Institute of Catalysis', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (22, 'Boston University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (23, 'Brazilian Synchrotron Light Laboratory (LNLS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (24, 'Brno University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (25, 'Brock University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (26, 'Brookhaven National Labs', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (27, 'CSIC - Instituto de Ciencia de Materiales de Madrid (ICMM)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (28, 'CSIC - Instituto de Estructura de la Materia (IEM)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (29, 'CEA - Commissariat à l’énergie atomique', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (30, 'Carnegie Mellon University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (31, 'Center for High Pressure Science & Technology Advanced Research (HPSTAR)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (32, 'Center for Physical Sciences and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (33, 'CSIC - Instituto de Química Física Rocasolano', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (34, 'Canadian Light Source Inc.', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (35, 'Carlsberg Laboratory', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (36, 'Cardiff University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (37, 'Center of Research and Advances Studies of the National Polytechnic Institute, (CINVESTAV-IPN)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (38, 'Centre for Art Technological Studies and Conservation (CATS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (39, 'Central Research Institute of Electric Power Industry (CRIEPI)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (40, 'Chalmers University of Technology (CTH)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (41, 'Centro Universitario de la Defensa', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (42, 'Centro Atomico Bariloche (CNEA)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (43, 'Charles University in Prague', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (44, 'Chiba University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (45, 'Chinese Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (46, 'CiC nanoGUNE Consolider', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (47, 'Copenhagen University Hospital Hvidovre', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (48, 'Cornell University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (49, 'Cukurova University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (50, 'Consejo Superior de Investigaciones Cientificas', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (51, 'Daresbury Laboratory', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (52, 'Delft University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (53, 'Democritus University of Thrace', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (54, 'Deutsches Elektronen-Synchrotron DESY', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (55, 'Diamond Light Source', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (56, 'Drexel University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (57, 'Donostia International Physics Center (DIPC)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (58, 'Dublin City University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (59, 'Durham University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (60, 'Duke University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (61, 'Dongguk University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (62, 'EMBL Hamburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (63, 'European Synchrotron Radiation Facility (ESRF)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (64, 'ETH Zürich', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (65, 'ELI Beamlines', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (66, 'EMBL Grenoble', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (67, 'ESPCI ParisTech', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (68, 'Swiss Federal Institute of Aquatic Science and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (69, 'Eberhard Karls Universität Tübingen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (70, 'Ecole Polytechnique Federale de Lausanne', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (71, 'Eindhoven University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (72, 'Elettra-Sincrotrone Trieste', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (73, 'Eli-alps Research Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (74, 'Escuela Superior de Ingenieria Quimica e Industrias Extractivas (ESIQIE-IPN)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (75, 'European Institute for Energy Research (EIFER)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (76, 'European Organisation for Nuclear Research (CERN)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (77, 'European XFEL GmbH', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (78, 'European Spallation Source ERIC (ESS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (79, 'Federal University of Rio Grande do Sul', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (80, 'Forschungszentrum Jülich', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (81, 'Firc Institute of Molecular Oncology Foundation, European Institute of Oncology - IFOM-IEO', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (82, 'Freie Universität Berlin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (83, 'Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (84, 'Fritz-Haber-Institut der Max-Planck-Gesellschaft', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (85, 'Friedrich Schiller University Jena', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (86, 'Fudan University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (87, 'GKSS Research Centre Geesthacht', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (88, 'Fujian Institute of Research on the Structure of Matter', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (89, 'GW Krieger School', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (90, 'Gdansk University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (91, 'Geologic Survey of Denmark and Greenland (GEUS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (92, 'Geological Survey of Norway (NGU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (93, 'Georg-August-Universität Göttingen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (94, 'Georgia Institute of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (95, 'Ghent University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (96, 'George Washington University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (97, 'Goethe Universität Frankfurt', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (98, 'Hagedorn Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (99, 'Halmstad University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (100, 'Hannover Medical School (MHH)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (101, 'HIST, Sør-Trøndelag University College', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (102, 'Gwangju Institute of Science and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (103, 'Helmholtz Centre for Infection Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (104, 'Helmholtz-Zentrum Berlin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (105, 'Hellenic Pasteur Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (106, 'Helmholtz-Zentrum Geesthacht', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (107, 'Hindustan University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (108, 'Hiroshima University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (109, 'Humboldt Universität zu Berlin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (110, 'ICMAB-CSIC', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (111, 'IMARES, Institute for Marine Resources and Ecosystem Studies', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (112, 'IRCCS Ospedale San Raffaele', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (113, 'Hokkaido University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (114, 'IRCER - Institut de Recherche sur les Céramiques', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (115, 'IRELEC-ALCEN', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (116, 'ITMO University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (117, 'ISSP RAS', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (118, 'Indian Institute of Science (IISc)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (119, 'Indian Association for the Cultivation of Science', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (120, 'Imperial College London', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (121, 'Immanuel Kant Baltic Federal University (IK BFU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (122, 'Indian Institute of Technology (BHU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (123, 'Indian Institute of Technology Bombay', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (124, 'Insituto de Tecnologia Quimica e Biologia (ITQB)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (125, 'Institut Laue-Langevin (ILL)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (126, 'Institut d´Electronique de Microelectronique et de Nanotechnologie', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (127, 'Institut de Biologie Structurale (IBS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (128, 'Institut de Physique et Chemie des Materiaux de Strasbourg (IPCMS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (129, 'Institute for Clinical Sciences Malmö, Lund University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (130, 'Institute for Stem Cell Biology and Regenerative Medicine (inStem) ', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (131, 'Institute for Energy Technology (IFE)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (132, 'Institute for Research in Biomedicine (IRB Barcelona)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (133, 'Institute of Advanced Chemistry of Catalonia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (134, 'Institute of Biochemistry', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (135, 'Institute of Nuclear Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (136, 'Institute of Organic Chemistry, Polish Academy of Science', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (137, 'Institute of Physics Belgrade', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (138, 'Institute of Physics of the Czech Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (139, 'Institute of Bioorganic Chemistry, Polish Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (140, 'Institute of Nuclear Chemistry and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (141, 'Institute of Physics, Polish Academy of Science', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (142, 'Institute of Protein Research RAS', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (143, 'Instituto Madrileno de Estudios Avanzados IMDEA Nanociencia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (144, 'Instituto Superior Tecnico', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (145, 'Institute of Plasma Physics and Laser Microfusion', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (146, 'Instituto de Ciencia de Materiales de Aragon - CSIC - Universidad de Zaragoza', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (147, 'Internationella Engelska Gymnasiet Södermalm (IEGS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (148, 'Irkutsk State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (149, 'Istituto di Metodologie Inorganiche e dei Plasmi - CNR-IMIP', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (150, 'Ivan Franko National University of Lviv', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (151, 'Jagiellonian University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (152, 'Istituto Italiano di Tecnologia (IIT)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (153, 'Istituto Officina dei Materiali IOM-CNR', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (154, 'Istituto di Struttura della Materia - CNR', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (155, 'Japan Atomic Energy Research Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (156, 'Japan Advanced Institute of Science and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (157, 'Jerzy Haber Institute of Catalysis and Surface Chemistry, Polish Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (158, 'Johannes Gutenberg-University Mainz', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (159, 'Japan Synchrotron Radiation Research Institute (JASRI)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (160, 'Justus-Liebig-Universität Giessen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (161, 'K.U. Leuven', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (162, 'Karl-Franzens University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (163, 'Jozef Stefan Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (164, 'Karlsruhe Insitute of Technology (KIT)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (165, 'Karlstad University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (166, 'Karolinska Institutet', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (167, 'Keio University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (168, 'Keuka College', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (169, 'Kharkov Institute of Physics and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (170, 'Kiev National T. Shevchenko University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (171, 'King Abdullah University of Science and Technology (KAUST)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (172, 'Keele University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (173, 'Koç University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (174, 'Kumamoto University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (175, 'Korea Advanced Institute of Science and Technology (KAIST)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (176, 'La Trobe University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (177, 'Laboratoire Léon Brillouin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (178, 'Laboratoire des Materiaux, Surfaces et Procedes pour la Catalyse (LMSPC-UMR)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (179, 'Latvian Biomedical Research and Study Centre', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (180, 'Latvian Institute of Organic Synthesis', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (181, 'Laboratori Nazionali di Frascati - INFN', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (182, 'Lawrence Berkeley National Laboratory, Advanced Light Source (ALS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (183, 'Laboratorio de Estudios Cristalograficos', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (184, 'Leibnitz Institute for Solid State and Materials Research, IFW', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (185, 'Laboratoire de Chimie Physique - Matière et rayonnement, CNRS & SU', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (186, 'Leibniz University Hannover', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (187, 'Leiden University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (188, 'Linköping University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (189, 'Linnaeus University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (190, 'Leibniz-Institut für innovative Mikroelektronik IHP', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (191, 'Luleå University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (192, 'Ludwig-Maximilians-Universität München', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (193, 'Lund University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (194, 'Los Alamos National Laboratory', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (195, 'Macquarie University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (196, 'Massey University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (197, 'Massachusetts Institute of Technology (MIT)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (198, 'Max Delbrück Center for Molecular Medicine in the Helmholtz Association (MDC)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (199, 'Max F. Perutz Laboratories (MFPL)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (200, 'Max Planck Institut für Kernphysik', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (201, 'Max Planck Institut für Plasmaphysik', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (202, 'Malmö University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (203, 'Manchester Metropolitan University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (204, 'Maria Curie-Sklodowska University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (205, 'Martin-Luther-Universität Halle-Wittenberg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (206, 'Max Planck Institut für Kohlenforschung', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (207, 'Max Planck Institute for Chemical Energy Conversion', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (208, 'Max Planck Institute for Biophysical Chemistry', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (209, 'Max Planck Institute for Chemical Physics of Solids', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (210, 'Max Planck Institute for Medical Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (211, 'Max Planck Institute for Metals Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (212, 'Max Planck Institute for Polymer Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (213, 'Max Planck Institute for Solid State Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (214, 'Maynooth University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (215, 'Mersin University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (216, 'Max Planck Institute of Colloids and Interfaces', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (217, 'Monash University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (218, 'Military University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (219, 'Montgomery College', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (220, 'Montanuniversität Leoben', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (221, 'Moscow Institute of Physics and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (222, 'Moscow State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (223, 'NORDITA, the Nordic Institute for Theoretical Physics', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (224, 'Moscow Engineering Physics Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (225, 'NIMBE - Nanosciences et Innovation pour les Matériaux la Biomédecine et l´Énergie', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (226, 'Nagoya Institute of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (227, 'National Hellenic Research Foundation', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (228, 'National Food Research Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (229, 'National Cheng Kung University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (230, 'Nencki Institute of Experimental Biology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (231, 'National University of Science and Technology (MISIS)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (232, 'National Institute for Medical Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (233, 'Newcastle University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (234, 'Nikolaev Institute of Inorganic Chemistry', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (235, 'Norwegian University of Life Sciences (NMBU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (236, 'Northwestern University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (237, 'New Mexico State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (238, 'Norwegian University of Science and Technology (NTNU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (239, 'Oregon State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (240, 'Okinawa Institute of Science and Technology Graduate University (OIST)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (241, 'Osaka University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (242, 'P.N. Lebedev Physical Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (243, 'Paul Scherrer Institute (PSI)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (244, 'Oak Ridge National Laboratory', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (245, 'Pavol Josef Šafárik University in Košice', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (246, 'Penn State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (247, 'Philipps-University Marburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (248, 'Peter the Great St. Petersburg Polytechnic University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (249, 'Peking University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (250, 'Pohang University of Science and Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (251, 'Polytechnic University of Marche', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (252, 'Princeton University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (253, 'Purdue University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (254, 'RISE Research Institute of Sweden', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (255, 'RMIT University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (256, 'Rice University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (257, 'Quanzhou Normal University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (258, 'Queen Mary University of London', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (259, 'Risø National Laboratory for Sustainable Energy- DTU', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (260, 'Royal Institute of Technology (KTH)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (261, 'Riga Technical University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (262, 'Rudjer Boskovic Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (263, 'Ruhr-University Bochum', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (264, 'Rutherford Appleton Laboratory - Central Laser Facility', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (265, 'ISIS Neutron and Muon Facility', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (266, 'Rzhanov Institute of Semiconductor Physics', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (267, 'SCK-CEN, Belgian Nuclear Research Centre', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (268, 'Russian Research Centre', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (269, 'SESAME Synchrotron', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (270, 'SIK, the Swedish Institute for Food and Biotechnology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (271, 'SINTEF Materials and Chemistry', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (272, 'SLAC National Accelerator Laboratory', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (273, 'SOLEIL Synchrotron', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (274, 'SP Technical Research Institute of Sweden', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (275, 'SPCTS - Science of Ceramic Processing and Surface Treatment', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (276, 'Saha Institute of Nuclear Physics', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (277, 'Sahlgrenska Academy at the University of Gothenburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (278, 'Shanghai Jiao Tong University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (279, 'Shanghai Institute of Applied Physics, Chinese Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (280, 'Shaanxi Normal University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (281, 'ShanghaiTech Uiversity', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (282, 'Shenyang Agricultural University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (283, 'Slovak Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (284, 'South China University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (285, 'Southeast University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (286, 'South Westphalia University of Applied Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (287, 'Southern Federal University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (288, 'Southern University of Science and Technology (SUSTech)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (289, 'Stockholm University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (290, 'Statens Serum Institut', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (291, 'Stony Brook University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (292, 'Sveriges Geologiska Undersökning (SGU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (293, 'Swedish Defence Research Agency (FOI)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (294, 'Swedish Geotechnical Institute (SGI)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (295, 'Swedish Museum of Natural History', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (296, 'Swedish Army Research Agency', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (297, 'Swedish University of Agricultural Sciences (SLU), Alnarp', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (298, 'Swedish Orphan Biovitrum', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (299, 'Swedish University of Agricultural Sciences (SLU), Umeå', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (300, 'Swedish University of Agricultural Sciences (SLU), Uppsala', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (301, 'Tampere University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (302, 'Tarbiat Modares University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (303, 'TU Bergakademie Freiberg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (304, 'Szczecin Technical University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (305, 'Technical University of Denmark (DTU)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (306, 'Technical University of Kaiserslautern', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (307, 'Technical University of Košice', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (308, 'Technical University of Lodz', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (309, 'Technische Universität Dresden', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (310, 'Technion - Israel Institute of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (311, 'Technische Universität Berlin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (312, 'Technische Universität Chemnitz', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (313, 'Technische Universität München', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (314, 'Tel Aviv University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (315, 'Tele and Radio Research Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (316, 'Tetra Pak', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (317, 'The Andrzej Soltan Institute for Nuclear Studies', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (318, 'The Hebrew University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (319, 'The Hashemite University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (320, 'Technische Universität Wien', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (321, 'The University of Tokyo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (322, 'The Open University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (323, 'The University of New South Wales', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (324, 'The University of Tokyo, Outstation SPring-8', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (325, 'Tomsk Polytechnic University ', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (326, 'The Novo Nordisk Foundation Center for Protein Research', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (327, 'Trinity College Dublin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (328, 'UNICAMP, University of Campinas', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (329, 'UMONS University of Mons', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (330, 'Umeå University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (331, 'UCIBIO - Applied Molecular Biosciences Unit', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (332, 'Universidad Autonoma de Madrid', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (333, 'Universidad Nacional Autonoma de Mexico (UNAM)', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (334, 'Universidad Complutense de Madrid', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (335, 'Universidad Politecnica de Madrid', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (336, 'Universidad de Valencia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (337, 'Universidade Federal da Bahia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (338, 'Universidade de Sao Paulo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (339, 'Universita degli Studi di Milano', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (340, 'Universita degli Studi di Palermo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (341, 'Universita degli Studi di Torino', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (342, 'Universita degli Studi Roma TRE', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (343, 'Universite Claude Bernard Lyon 1', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (344, 'Universite Montpellier II', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (345, 'Universite Paris 13', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (346, 'Universite Paris Sud', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (347, 'Universitat Autonoma de Barcelona', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (348, 'Universite Paris Sud 11', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (349, 'Universite Pierre et Marie Curie - Paris VI', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (350, 'Universite d Orleans', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (351, 'Universite de Cergy-Pontoise', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (352, 'Universite de Strasbourg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (353, 'Universite Paris-Sud', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (354, 'University College Dublin', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (355, 'University Medical Centre Göttingen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (356, 'University of Alicante', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (357, 'University of Antwerp', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (358, 'University of Amsterdam', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (359, 'University College London', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (360, 'University of Babes-Bolyai', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (361, 'University of Barcelona', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (362, 'University of Bayreuth', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (363, 'University of Bergen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (364, 'University of Athens', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (365, 'University of Basel', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (366, 'University of Bath', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (367, 'University of Bialystok', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (368, 'University of Bologna', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (369, 'University of Bordeaux', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (370, 'University of Bradford', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (371, 'University of Brasilia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (372, 'University of Bremen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (373, 'University of Brighton', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (374, 'University of Bristol', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (375, 'University of California, Los Angeles', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (376, 'University of California, Santa Barbara', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (377, 'University of Cambridge', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (378, 'University of Bordeaux', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (379, 'University of Cape Town', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (380, 'University of Coimbra', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (381, 'University of Colorado', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (382, 'University of Connecticut', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (383, 'University of Copenhagen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (384, 'University of Central Florida', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (385, 'University of Central Lancashire', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (386, 'University of Cordoba', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (387, 'University of Eastern Finland', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (388, 'University of Dundee', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (389, 'University of East Anglia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (390, 'University of Edinburgh', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (391, 'University of Freiburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (392, 'University of Fribourg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (393, 'University of Gdansk', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (394, 'University of Geneva', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (395, 'University of Glasgow', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (396, 'University of Florida', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (397, 'University of Gothenburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (398, 'University of Helsinki', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (399, 'University of Greifswald', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (400, 'University of Groningen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (401, 'University of Iceland', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (402, 'University of Illinois', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (403, 'University of Innsbruck', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (404, 'University of Ioannina', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (405, 'University of Hyogo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (406, 'University of Jordan', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (407, 'University of Jyväskylä', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (408, 'University of Kassel', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (409, 'University of Kentucky', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (410, 'University of L´Aquila', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (411, 'University of Latvia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (412, 'University of Leeds', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (413, 'University of Leicester', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (414, 'University of Limerick', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (415, 'University of Manchester', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (416, 'University of Massachusetts Dartmouth', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (417, 'University of Ljubljana', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (418, 'University of Lübeck', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (419, 'University of Melbourne', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (420, 'University of Minho', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (421, 'University of Michigan', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (422, 'University of Nis', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (423, 'University of Natural Resources and Applied Life Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (424, 'University of Nottingham', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (425, 'University of Oslo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (426, 'University of Oulu', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (427, 'University of Oradea', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (428, 'University of Nova Gorica', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (429, 'University of Oslo - Oslo University Hospital', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (430, 'University of Oxford', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (431, 'University of Oviedo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (432, 'University of Patras', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (433, 'University of Padova', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (434, 'University of Poitiers', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (435, 'University of Potsdam', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (436, 'University of Reading', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (437, 'University of Regensburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (438, 'University of Portsmouth', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (439, 'University of Porto', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (440, 'University of Pretoria', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (441, 'University of Rome La Sapienza', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (442, 'University of Rome Tor Vergata', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (443, 'University of Sao Paulo', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (444, 'University of Roskilde', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (445, 'University of Saarland', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (446, 'University of Santiago de Compostela', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (447, 'University of Sassari', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (448, 'University of Saskatchewan', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (449, 'University of Sherbrooke', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (450, 'University of Silesia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (451, 'University of Science and Technology of China', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (452, 'University of Skövde', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (453, 'University of Science and Technology Beijing', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (454, 'University of Siegen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (455, 'University of Southampton', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (456, 'University of Southern Denmark', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (457, 'University of St Andrews', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (458, 'University of St. Petersburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (459, 'University of Stavanger', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (460, 'University of Thessaly', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (461, 'University of Tartu', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (462, 'University of Toronto', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (463, 'University of Szeged', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (464, 'University of Tromsø', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (465, 'University of Turku', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (466, 'University of Trento', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (467, 'University of Ulster', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (468, 'University of Ulster, Jordanstown campus', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (469, 'University of Verona', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (470, 'University of Vienna', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (471, 'University of Twente', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (472, 'University of Virginia', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (473, 'University of Wisconsin-Madison', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (474, 'University of Wisconsin-Milwaukee', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (475, 'University of Warsaw', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (476, 'University of Warwick', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (477, 'University of Wollongong', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (478, 'University of the Basque Country', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (479, 'University of Zürich', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (480, 'Università degli Studi di Genova', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (481, 'University of the Sunshine Coast', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (482, 'University of York', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (483, 'Universität Augsburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (484, 'Universität Göttingen', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (485, 'Universität Hamburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (486, 'Universität Heidelberg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (487, 'Università degli Studi di Trieste', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (488, 'Universität Kiel', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (489, 'Universität Würzburg', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (490, 'Universität Osnabrück', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (491, 'Universität Leipzig', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (492, 'Universität zu Köln', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (493, 'Universität Konstanz', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (494, 'Université de Montpellier', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (495, 'Uppsala University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (496, 'Université Grenoble Alpes', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (497, 'Ural Division of the Russian Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (498, 'Urmia University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (499, 'Utrecht University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (500, 'Ural Federal University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (501, 'Ural State Technical University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (502, 'VSB-Technical University of Ostrava', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (503, 'Vienna University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (504, 'Vilnius University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (505, 'Victoria University of Wellington', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (506, 'Voronezh State University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (507, 'Vrije Universiteit Brussel', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (508, 'W. Trzebiatowski Institute of Low Temperature and Structure Research, Polish Academy of Sciences', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (509, 'Weill Cornell Medical College, Cornell University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (510, 'Weizmann Institute of Science', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (511, 'Vinogradov Institute of Geochemistry SB RAS', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (512, 'Wageningen University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (513, 'Wigner Research Centre for Physics', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (514, 'Wuhan University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (515, 'Yonsei University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (516, 'YKI, Institute for Surface Chemistry', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (517, 'Yeditepe University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (518, 'ZHAW - Zürcher Hochschule für Angewandte Wissenschaften', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (519, 'Zhejiang University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (520, 'Wroclaw University of Technology', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (521, 'Wihuri Research Institute', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (522, 'Örebro University', true);
INSERT INTO public.institutions (institution_id, institution, verified) VALUES (523, 'Åbo Akademi University', true);


--
-- TOC entry 3683 (class 0 OID 17099)
-- Dependencies: 250
-- Data for Name: instrument_has_proposals; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3684 (class 0 OID 17119)
-- Dependencies: 251
-- Data for Name: instrument_has_scientists; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3681 (class 0 OID 17075)
-- Dependencies: 248
-- Data for Name: instruments; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3657 (class 0 OID 16689)
-- Dependencies: 224
-- Data for Name: nationalities; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.nationalities (nationality_id, nationality) VALUES (1, 'Afghan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (2, 'Albanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (3, 'Algerian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (4, 'American');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (5, 'Andorran');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (6, 'Angolan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (7, 'Antiguans');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (8, 'Argentinean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (9, 'Armenian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (10, 'Australian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (11, 'Austrian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (12, 'Azerbaijani');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (13, 'Bahamian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (14, 'Bahraini');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (15, 'Bangladeshi');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (16, 'Barbadian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (17, 'Barbudans');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (18, 'Batswana');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (19, 'Belarusian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (20, 'Belgian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (21, 'Belizean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (22, 'Beninese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (23, 'Bhutanese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (24, 'Bolivian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (25, 'Bosnian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (26, 'Brazilian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (27, 'British');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (28, 'Bruneian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (29, 'Bulgarian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (30, 'Burkinabe');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (31, 'Burmese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (32, 'Burundian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (33, 'Cambodian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (34, 'Cameroonian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (35, 'Canadian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (36, 'Cape Verdean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (37, 'Central African');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (38, 'Chadian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (39, 'Chilean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (40, 'Chinese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (41, 'Colombian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (42, 'Comoran');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (43, 'Congolese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (44, 'Costa Rican');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (45, 'Croatian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (46, 'Cuban');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (47, 'Cypriot');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (48, 'Czech');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (49, 'Danish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (50, 'Djibouti');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (51, 'Dominican');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (52, 'Dutch');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (53, 'East Timorese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (54, 'Ecuadorean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (55, 'Egyptian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (56, 'Emirian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (57, 'Equatorial Guinean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (58, 'Eritrean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (59, 'Estonian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (60, 'Ethiopian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (61, 'Fijian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (62, 'Filipino');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (63, 'Finnish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (64, 'French');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (65, 'Gabonese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (66, 'Gambian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (67, 'Georgian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (68, 'German');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (69, 'Ghanaian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (70, 'Greek');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (71, 'Grenadian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (72, 'Guatemalan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (73, 'Guinea-Bissauan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (74, 'Guinean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (75, 'Guyanese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (76, 'Haitian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (77, 'Herzegovinian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (78, 'Honduran');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (79, 'Hungarian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (80, 'Icelander');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (81, 'Indian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (82, 'Indonesian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (83, 'Iranian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (84, 'Iraqi');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (85, 'Irish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (86, 'Israeli');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (87, 'Italian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (88, 'Ivorian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (89, 'Jamaican');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (90, 'Japanese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (91, 'Jordanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (92, 'Kazakhstani');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (93, 'Kenyan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (94, 'Kittian and Nevisian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (95, 'Kuwaiti');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (96, 'Kyrgyz');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (97, 'Laotian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (98, 'Latvian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (99, 'Lebanese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (100, 'Liberian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (101, 'Libyan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (102, 'Liechtensteiner');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (103, 'Lithuanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (104, 'Luxembourger');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (105, 'Macedonian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (106, 'Malagasy');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (107, 'Malawian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (108, 'Malaysian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (109, 'Maldivan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (110, 'Malian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (111, 'Maltese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (112, 'Marshallese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (113, 'Mauritanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (114, 'Mauritian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (115, 'Mexican');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (116, 'Micronesian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (117, 'Moldovan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (118, 'Monacan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (119, 'Mongolian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (120, 'Moroccan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (121, 'Mosotho');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (122, 'Motswana');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (123, 'Mozambican');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (124, 'Namibian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (125, 'Nauruan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (126, 'Nepalese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (127, 'New Zealander');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (128, 'Ni-Vanuatu');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (129, 'Nicaraguan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (130, 'Nigerien');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (131, 'North Korean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (132, 'Northern Irish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (133, 'Norwegian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (134, 'Omani');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (135, 'Pakistani');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (136, 'Palauan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (137, 'Panamanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (138, 'Papua New Guinean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (139, 'Paraguayan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (140, 'Peruvian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (141, 'Polish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (142, 'Portuguese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (143, 'Qatari');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (144, 'Romanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (145, 'Russian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (146, 'Rwandan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (147, 'Saint Lucian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (148, 'Salvadoran');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (149, 'Samoan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (150, 'San Marinese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (151, 'Sao Tomean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (152, 'Saudi');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (153, 'Senegalese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (154, 'Serbian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (155, 'Seychellois');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (156, 'Sierra Leonean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (157, 'Singaporean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (158, 'Slovakian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (159, 'Slovenian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (160, 'Solomon Islander');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (161, 'Somali');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (162, 'South African');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (163, 'South Korean');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (164, 'Spanish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (165, 'Sri Lankan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (166, 'Sudanese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (167, 'Surinamer');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (168, 'Swazi');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (169, 'Swedish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (170, 'Swiss');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (171, 'Syrian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (172, 'Taiwanese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (173, 'Tajik');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (174, 'Tanzanian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (175, 'Thai');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (176, 'Togolese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (177, 'Tongan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (178, 'Trinidadian or Tobagonian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (179, 'Tunisian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (180, 'Turkish');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (181, 'Tuvaluan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (182, 'Ugandan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (183, 'Ukrainian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (184, 'Uruguayan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (185, 'Uzbekistani');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (186, 'Venezuelan');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (187, 'Vietnamese');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (188, 'Yemenite');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (189, 'Zambian');
INSERT INTO public.nationalities (nationality_id, nationality) VALUES (190, 'Zimbabwean');


--
-- TOC entry 3649 (class 0 OID 16584)
-- Dependencies: 216
-- Data for Name: old_files; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3653 (class 0 OID 16619)
-- Dependencies: 220
-- Data for Name: pagetext; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.pagetext (pagetext_id, content) VALUES (1, 'HOMEPAGE');
INSERT INTO public.pagetext (pagetext_id, content) VALUES (2, 'HELPPAGE');
INSERT INTO public.pagetext (pagetext_id, content) VALUES (3, 'PRIVACYPAGE');
INSERT INTO public.pagetext (pagetext_id, content) VALUES (4, 'COOKIEPAGE');
INSERT INTO public.pagetext (pagetext_id, content) VALUES (5, 'REVIEWPAGE');
INSERT INTO public.pagetext (pagetext_id, content) VALUES (6, '');


--
-- TOC entry 3695 (class 0 OID 17273)
-- Dependencies: 262
-- Data for Name: proposal_events; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3688 (class 0 OID 17200)
-- Dependencies: 255
-- Data for Name: proposal_statuses; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (1, 'DRAFT', 'When proposal is created it gets draft status before it is submitted.', true, 'DRAFT');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (2, 'FEASIBILITY_REVIEW', 'Status that indicates that proposal feasibility review should be done.', true, 'FEASIBILITY_REVIEW');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (3, 'NOT_FEASIBLE', 'Status that indicates that proposal is not feasible.', true, 'NOT_FEASIBLE');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (4, 'SEP_SELECTION', 'Status that indicates that proposal is ready to be assigned to SEP.', true, 'SEP_SELECTION');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (5, 'SEP_REVIEW', 'Proposal SEP review should be done.', true, 'SEP_REVIEW');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (6, 'ALLOCATED', 'Proposal time allocation should be done.', true, 'ALLOCATED');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (7, 'NOT_ALLOCATED', 'Proposal is not allocated.', true, 'NOT_ALLOCATED');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (8, 'SCHEDULING', 'Proposal should be scheduled.', true, 'SCHEDULING');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (9, 'EXPIRED', 'Proposal has expired.', true, 'EXPIRED');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (10, 'Feasibility and sample review', 'Status that indicates that proposal feasibility and sample review can be done in the same time.', true, 'FEASIBILITY_AND_SAMPLE_REVIEW');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (11, 'Sample review', 'Status that indicates that proposal sample review can be done.', true, 'SAMPLE_REVIEW');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (12, 'SEP Meeting', 'Proposal is ready for SEP meeting ranking.', true, 'SEP_MEETING');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (13, 'Management decision', 'Proposal is ready for management decision.', true, 'MANAGEMENT_DECISION');
INSERT INTO public.proposal_statuses (proposal_status_id, name, description, is_default, short_code) VALUES (14, 'EDITABLE_SUBMITTED', 'Proposal is editable after submission.', false, 'EDITABLE_SUBMITTED');


--
-- TOC entry 3642 (class 0 OID 16521)
-- Dependencies: 209
-- Data for Name: proposal_user; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3692 (class 0 OID 17216)
-- Dependencies: 259
-- Data for Name: proposal_workflow_connections; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3690 (class 0 OID 17208)
-- Dependencies: 257
-- Data for Name: proposal_workflows; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3634 (class 0 OID 16423)
-- Dependencies: 201
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3635 (class 0 OID 16441)
-- Dependencies: 202
-- Data for Name: question_datatypes; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('TEXT_INPUT');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('SELECTION_FROM_OPTIONS');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('BOOLEAN');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('DATE');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('FILE_UPLOAD');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('EMBELLISHMENT');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('SAMPLE_BASIS');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('PROPOSAL_BASIS');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('SAMPLE_DECLARATION');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('INTERVAL');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('NUMBER_INPUT');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('SHIPMENT_BASIS');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('RICH_TEXT_INPUT');
INSERT INTO public.question_datatypes (question_datatype_id) VALUES ('VISIT_BASIS');


--
-- TOC entry 3702 (class 0 OID 17435)
-- Dependencies: 269
-- Data for Name: question_dependencies; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3678 (class 0 OID 16999)
-- Dependencies: 245
-- Data for Name: questionaries; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3639 (class 0 OID 16458)
-- Dependencies: 206
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.questions (question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id) VALUES ('sample_basis', 'SAMPLE_BASIS', 'Sample basic information', '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}', '2023-01-10 16:15:01.97195+00', '2023-01-10 16:15:01.97195+00', 'sample_basis', 2);
INSERT INTO public.questions (question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id) VALUES ('proposal_basis', 'PROPOSAL_BASIS', 'Proposal basic information', '{"required":false,"small_label":"","tooltip":""}', '2023-01-10 16:15:01.97195+00', '2023-01-10 16:15:01.97195+00', 'proposal_basis', 1);
INSERT INTO public.questions (question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id) VALUES ('shipment_basis', 'SHIPMENT_BASIS', 'Shipment basic information', '{"required":false,"small_label":"","tooltip":""}', '2023-01-10 16:15:02.303951+00', '2023-01-10 16:15:02.303951+00', 'shipment_basis', 3);
INSERT INTO public.questions (question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id) VALUES ('visit_basis', 'VISIT_BASIS', 'Visit basic information', '{"required":false,"small_label":"","tooltip":""}', '2023-01-10 16:15:02.956124+00', '2023-01-10 16:15:03.120205+00', 'visitat_basis', 4);


--
-- TOC entry 3679 (class 0 OID 17024)
-- Dependencies: 246
-- Data for Name: questions_has_template; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3645 (class 0 OID 16544)
-- Dependencies: 212
-- Data for Name: role_user; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (2, 0, 1);
INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (1, 1, 2);
INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (2, 2, 3);
INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (1, 4, 5);
INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (1, 5, 6);
INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (1, 6, 7);
INSERT INTO public.role_user (role_id, user_id, role_user_id) VALUES (6, 3, 4);


--
-- TOC entry 3644 (class 0 OID 16538)
-- Dependencies: 211
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.roles (role_id, short_code, title) VALUES (1, 'user', 'User');
INSERT INTO public.roles (role_id, short_code, title) VALUES (2, 'user_officer', 'User Officer');
INSERT INTO public.roles (role_id, short_code, title) VALUES (4, 'sep_chair', 'SEP Chair');
INSERT INTO public.roles (role_id, short_code, title) VALUES (5, 'sep_secretary', 'SEP Secretary');
INSERT INTO public.roles (role_id, short_code, title) VALUES (6, 'sep_reviewer', 'SEP Reviewer');
INSERT INTO public.roles (role_id, short_code, title) VALUES (7, 'instrument_scientist', 'Instrument Scientist');
INSERT INTO public.roles (role_id, short_code, title) VALUES (8, 'sample_safety_reviewer', 'Sample safety reviewer');


--
-- TOC entry 3686 (class 0 OID 17138)
-- Dependencies: 253
-- Data for Name: samples; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3709 (class 0 OID 17592)
-- Dependencies: 276
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('EXTERNAL_AUTH_LOGIN_URL', 'https://devusers.facilities.rl.ac.uk/auth/Login.aspx', 'P&O Login URL');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_PRIMARY_DARK', '#519548', 'Hex value for primary dark colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_PRIMARY_MAIN', '#519548', 'Hex value for primary main colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_PRIMARY_LIGHT', '#BEF202', 'Hex value for primary light colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_PRIMARY_ACCENT', '#000000', '');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_PRIMARY_CONTRAST', '#ffffff', 'Hex value for primary contrast text colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_SECONDARY_DARK', '#1B676B', 'Hex value for secondary dark colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_SECONDARY_MAIN', '#1B676B', 'Hex value for secondary main colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_SECONDARY_LIGHT', '#1B676B', 'Hex value for secondary light colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_SECONDARY_CONTRAST', '#ffffff', 'Hex value for secondary contrast text colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_ERROR_MAIN', '#f44336', 'Hex value for error main colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_SUCCESS_MAIN', '#4caf50', 'Hex value for success main colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_WARNING_MAIN', '#ff9800', 'Hex value for warning main colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('PALETTE_INFO_MAIN', '#2196f3', 'Hex value for info main colour');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('HEADER_LOGO_FILENAME', 'ess-white.svg', 'The filename of the image to use in the header. E.g. stfc-ukri-white.svg');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('DEFAULT_INST_SCI_REVIEWER_FILTER', 'ME', '');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('DEFAULT_INST_SCI_STATUS_FILTER', 'FEASIBILITY_REVIEW', '');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('TIMEZONE', 'Europe/Stockholm', '');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('DATE_FORMAT', 'dd-MM-yyyy', '');
INSERT INTO public.settings (settings_id, settings_value, description) VALUES ('DATE_TIME_FORMAT', 'dd-MM-yyyy HH:mm', '');


--
-- TOC entry 3698 (class 0 OID 17371)
-- Dependencies: 265
-- Data for Name: shipments; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3700 (class 0 OID 17420)
-- Dependencies: 267
-- Data for Name: shipments_has_samples; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3694 (class 0 OID 17255)
-- Dependencies: 261
-- Data for Name: status_changing_events; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3663 (class 0 OID 16729)
-- Dependencies: 230
-- Data for Name: technical_review; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3676 (class 0 OID 16991)
-- Dependencies: 243
-- Data for Name: template_categories; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.template_categories (template_category_id, name) VALUES (1, 'Proposal');
INSERT INTO public.template_categories (template_category_id, name) VALUES (2, 'Sample declaration');
INSERT INTO public.template_categories (template_category_id, name) VALUES (3, 'Shipment declaration');
INSERT INTO public.template_categories (template_category_id, name) VALUES (4, 'Visit');


--
-- TOC entry 3670 (class 0 OID 16856)
-- Dependencies: 237
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.templates (template_id, name, description, is_archived, category_id) VALUES (1, 'default template', 'original template', false, 1);


--
-- TOC entry 3672 (class 0 OID 16892)
-- Dependencies: 239
-- Data for Name: templates_has_questions; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.templates_has_questions (id, question_id, template_id, topic_id, sort_order, config, dependencies_operator) VALUES (1, 'proposal_basis', 1, 1, 0, '{"required":false,"small_label":"","tooltip":""}', 'AND');


--
-- TOC entry 3654 (class 0 OID 16628)
-- Dependencies: 221
-- Data for Name: topic_completenesses; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3638 (class 0 OID 16450)
-- Dependencies: 205
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.topics (topic_id, topic_title, is_enabled, sort_order, template_id) VALUES (1, 'New proposal', true, 0, 1);


--
-- TOC entry 3706 (class 0 OID 17485)
-- Dependencies: 273
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.units (unit_id, unit) VALUES (1, 'kelvin');
INSERT INTO public.units (unit_id, unit) VALUES (2, 'celsius');


--
-- TOC entry 3632 (class 0 OID 16400)
-- Dependencies: 199
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: duouser
--

INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (0, 'Mr.', '', 'Service account', '', 'service', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Service account', '', '', 'male', '2000-04-02', '', '', 'service@useroffice.ess.eu', true, '', '', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.808644+00', 1, 1, false);
INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (1, 'Mr.', 'Christian', 'Carl', 'Carlsson', 'testuser', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Carl', '123123123', '581459604', 'male', '2000-04-02', 'IT deparment', 'Strategist', 'Javon4@hotmail.com', true, '(288) 431-1443', '(370) 386-8976', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.808644+00', 1, 1, false);
INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (2, 'Mr.', 'Adam', 'Anders', 'Andersson', 'testofficer', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Alexander', '878321897', '123123123', 'male', '1981-08-05', 'IT department', 'Liaison', 'Aaron_Harris49@gmail.com', true, '711-316-5728', '1-359-864-3489 x7390', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.808644+00', 1, 1, false);
INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (3, 'Mr.', 'Noah', 'Nils', 'Nilsson', 'testreviewer', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Nicolas', '878321897', '123123123', 'male', '1981-08-05', 'IT department', 'Liaison', 'nils@ess.se', true, '711-316-5728', '1-359-864-3489 x7390', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.808644+00', 1, 1, false);
INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (4, 'Mr.', 'Bryson', 'Benjamin', 'Beckley', 'testuser2', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'Benjamin', '123123123', '581459604', 'male', '2000-04-02', 'IT deparment', 'Management', 'ben@inbox.com', true, '(288) 221-4533', '(370) 555-4432', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.808644+00', 1, 1, false);
INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (6, 'Mr.', 'David', 'David', 'Dawson', 'testuser4', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', 'David', '123123123', '581459604', 'male', '1995-04-01', 'Maxillofacial surgeon', 'Management', 'david@teleworm.us', true, '0676 472 14 66', '0676 159 94 87', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.808644+00', 1, 1, false);
INSERT INTO public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, orcid_refreshtoken, gender, birthdate, department, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at, organisation, nationality, placeholder) VALUES (5, 'Mr.', '', 'Unverified email', 'Placeholder', 'testuser3', '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm', '', '123123123', '581459604', 'male', '2000-04-02', 'IT deparment', 'Management', 'unverified-user@example.com', false, '(288) 221-4533', '(370) 555-4432', '2023-01-10 16:15:00.320829+00', '2023-01-10 16:15:00.821046+00', 1, 1, true);


--
-- TOC entry 3711 (class 0 OID 17609)
-- Dependencies: 278
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3712 (class 0 OID 17633)
-- Dependencies: 279
-- Data for Name: visits_has_users; Type: TABLE DATA; Schema: public; Owner: duouser
--



--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 233
-- Name: SEPs_sep_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public."SEPs_sep_id_seq"', 1, true);


--
-- TOC entry 3751 (class 0 OID 0)
-- Dependencies: 217
-- Name: call_call_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.call_call_id_seq', 1, true);


--
-- TOC entry 3752 (class 0 OID 0)
-- Dependencies: 227
-- Name: countries_country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.countries_country_id_seq', 199, true);


--
-- TOC entry 3753 (class 0 OID 0)
-- Dependencies: 231
-- Name: event_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.event_logs_id_seq', 1, false);


--
-- TOC entry 3754 (class 0 OID 0)
-- Dependencies: 215
-- Name: files_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.files_file_id_seq', 1, false);


--
-- TOC entry 3755 (class 0 OID 0)
-- Dependencies: 225
-- Name: institutions_institution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.institutions_institution_id_seq', 523, true);


--
-- TOC entry 3756 (class 0 OID 0)
-- Dependencies: 247
-- Name: instruments_instrument_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.instruments_instrument_id_seq', 1, false);


--
-- TOC entry 3757 (class 0 OID 0)
-- Dependencies: 223
-- Name: nationalities_nationality_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.nationalities_nationality_id_seq', 190, true);


--
-- TOC entry 3758 (class 0 OID 0)
-- Dependencies: 260
-- Name: next_status_events_next_status_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.next_status_events_next_status_event_id_seq', 1, false);


--
-- TOC entry 3759 (class 0 OID 0)
-- Dependencies: 219
-- Name: pagetext_pagetext_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.pagetext_pagetext_id_seq', 5, true);


--
-- TOC entry 3760 (class 0 OID 0)
-- Dependencies: 207
-- Name: proposal_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_answers_answer_id_seq', 1, false);


--
-- TOC entry 3761 (class 0 OID 0)
-- Dependencies: 238
-- Name: proposal_question__proposal_template__rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_question__proposal_template__rels_id_seq', 1, true);


--
-- TOC entry 3762 (class 0 OID 0)
-- Dependencies: 254
-- Name: proposal_statuses_proposal_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_statuses_proposal_status_id_seq', 14, true);


--
-- TOC entry 3763 (class 0 OID 0)
-- Dependencies: 236
-- Name: proposal_templates_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_templates_template_id_seq', 1, true);


--
-- TOC entry 3764 (class 0 OID 0)
-- Dependencies: 204
-- Name: proposal_topics_sort_order_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_topics_sort_order_seq', 1, false);


--
-- TOC entry 3765 (class 0 OID 0)
-- Dependencies: 203
-- Name: proposal_topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_topics_topic_id_seq', 1, true);


--
-- TOC entry 3766 (class 0 OID 0)
-- Dependencies: 258
-- Name: proposal_workflow_connections_proposal_workflow_connection__seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_workflow_connections_proposal_workflow_connection__seq', 1, false);


--
-- TOC entry 3767 (class 0 OID 0)
-- Dependencies: 256
-- Name: proposal_workflows_proposal_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposal_workflows_proposal_workflow_id_seq', 1, false);


--
-- TOC entry 3768 (class 0 OID 0)
-- Dependencies: 200
-- Name: proposals_proposal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposals_proposal_id_seq', 1, false);


--
-- TOC entry 3769 (class 0 OID 0)
-- Dependencies: 222
-- Name: proposals_short_code_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.proposals_short_code_seq', 1, false);


--
-- TOC entry 3770 (class 0 OID 0)
-- Dependencies: 268
-- Name: question_dependencies_question_dependency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.question_dependencies_question_dependency_id_seq', 1, false);


--
-- TOC entry 3771 (class 0 OID 0)
-- Dependencies: 244
-- Name: questionaries_questionary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.questionaries_questionary_id_seq', 1, false);


--
-- TOC entry 3772 (class 0 OID 0)
-- Dependencies: 213
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- TOC entry 3773 (class 0 OID 0)
-- Dependencies: 240
-- Name: role_user_role_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.role_user_role_user_id_seq', 7, true);


--
-- TOC entry 3774 (class 0 OID 0)
-- Dependencies: 210
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.roles_role_id_seq', 8, true);


--
-- TOC entry 3775 (class 0 OID 0)
-- Dependencies: 252
-- Name: samples_sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.samples_sample_id_seq', 1, false);


--
-- TOC entry 3776 (class 0 OID 0)
-- Dependencies: 264
-- Name: shipments_shipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.shipments_shipment_id_seq', 1, false);


--
-- TOC entry 3777 (class 0 OID 0)
-- Dependencies: 229
-- Name: technical_review_technical_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.technical_review_technical_review_id_seq', 1, false);


--
-- TOC entry 3778 (class 0 OID 0)
-- Dependencies: 242
-- Name: template_categories_template_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.template_categories_template_category_id_seq', 4, true);


--
-- TOC entry 3779 (class 0 OID 0)
-- Dependencies: 272
-- Name: units_unit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.units_unit_id_seq', 2, true);


--
-- TOC entry 3780 (class 0 OID 0)
-- Dependencies: 198
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.users_user_id_seq', 6, true);


--
-- TOC entry 3781 (class 0 OID 0)
-- Dependencies: 277
-- Name: visitations_visitation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

PERFORM pg_catalog.setval('public.visitations_visitation_id_seq', 1, false);


--
-- TOC entry 3351 (class 2606 OID 16978)
-- Name: SEP_Assignments SEP_Assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Assignments"
    ADD CONSTRAINT "SEP_Assignments_pkey" PRIMARY KEY (proposal_pk, sep_member_user_id, sep_id);


--
-- TOC entry 3361 (class 2606 OID 16966)
-- Name: SEP_Proposals SEP_Proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Proposals"
    ADD CONSTRAINT "SEP_Proposals_pkey" PRIMARY KEY (proposal_pk, sep_id);


--
-- TOC entry 3412 (class 2606 OID 17512)
-- Name: SEP_Reviewers SEP_Reviewers_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviewers"
    ADD CONSTRAINT "SEP_Reviewers_pkey" PRIMARY KEY (user_id, sep_id);


--
-- TOC entry 3414 (class 2606 OID 17558)
-- Name: SEP_meeting_decisions SEP_meeting_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_meeting_decisions"
    ADD CONSTRAINT "SEP_meeting_decisions_pkey" PRIMARY KEY (proposal_pk);


--
-- TOC entry 3349 (class 2606 OID 16775)
-- Name: SEPs SEPs_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEPs"
    ADD CONSTRAINT "SEPs_pkey" PRIMARY KEY (sep_id);


--
-- TOC entry 3400 (class 2606 OID 17505)
-- Name: active_templates active_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.active_templates
    ADD CONSTRAINT active_templates_pkey PRIMARY KEY (category_id, template_id);


--
-- TOC entry 3304 (class 2606 OID 16494)
-- Name: answers answers_answer_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_answer_id_key UNIQUE (answer_id);


--
-- TOC entry 3306 (class 2606 OID 16492)
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (questionary_id, question_id);


--
-- TOC entry 3408 (class 2606 OID 17477)
-- Name: api_permissions api_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.api_permissions
    ADD CONSTRAINT api_permissions_pkey PRIMARY KEY (access_token_id);


--
-- TOC entry 3371 (class 2606 OID 17088)
-- Name: call_has_instruments call_has_instrument_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call_has_instruments
    ADD CONSTRAINT call_has_instrument_pkey PRIMARY KEY (call_id, instrument_id);


--
-- TOC entry 3323 (class 2606 OID 16616)
-- Name: call call_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_pkey PRIMARY KEY (call_id);


--
-- TOC entry 3339 (class 2606 OID 16714)
-- Name: countries countries_country_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_country_id_key UNIQUE (country_id);


--
-- TOC entry 3341 (class 2606 OID 17499)
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);





--
-- TOC entry 3347 (class 2606 OID 16758)
-- Name: event_logs event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3406 (class 2606 OID 17468)
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (feature_id);


--
-- TOC entry 3394 (class 2606 OID 17366)
-- Name: files files_oid_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_oid_key UNIQUE (oid);


--
-- TOC entry 3396 (class 2606 OID 17364)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 3335 (class 2606 OID 16705)
-- Name: institutions institutions_institution_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_institution_id_key UNIQUE (institution_id);


--
-- TOC entry 3337 (class 2606 OID 17497)
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (institution_id);


--
-- TOC entry 3373 (class 2606 OID 17103)
-- Name: instrument_has_proposals instrument_has_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instrument_has_proposals
    ADD CONSTRAINT instrument_has_proposals_pkey PRIMARY KEY (instrument_id, proposal_pk);


--
-- TOC entry 3375 (class 2606 OID 17123)
-- Name: instrument_has_scientists instrument_has_scientists_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instrument_has_scientists
    ADD CONSTRAINT instrument_has_scientists_pkey PRIMARY KEY (instrument_id, user_id);


--
-- TOC entry 3369 (class 2606 OID 17083)
-- Name: instruments instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instruments
    ADD CONSTRAINT instruments_pkey PRIMARY KEY (instrument_id);


--
-- TOC entry 3331 (class 2606 OID 16695)
-- Name: nationalities nationalities_nationality_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.nationalities
    ADD CONSTRAINT nationalities_nationality_id_key UNIQUE (nationality_id);


--
-- TOC entry 3333 (class 2606 OID 17495)
-- Name: nationalities nationalities_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.nationalities
    ADD CONSTRAINT nationalities_pkey PRIMARY KEY (nationality_id);


--
-- TOC entry 3388 (class 2606 OID 17260)
-- Name: status_changing_events next_status_events_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.status_changing_events
    ADD CONSTRAINT next_status_events_pkey PRIMARY KEY (status_changing_event_id);


--
-- TOC entry 3319 (class 2606 OID 16595)
-- Name: old_files old_files_oid_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.old_files
    ADD CONSTRAINT old_files_oid_key UNIQUE (oid);


--
-- TOC entry 3321 (class 2606 OID 16593)
-- Name: old_files old_files_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.old_files
    ADD CONSTRAINT old_files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 3325 (class 2606 OID 16627)
-- Name: pagetext pagetext_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.pagetext
    ADD CONSTRAINT pagetext_pkey PRIMARY KEY (pagetext_id);


--
-- TOC entry 3317 (class 2606 OID 16571)
-- Name: SEP_Reviews prop_user_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviews"
    ADD CONSTRAINT prop_user_pkey PRIMARY KEY (proposal_pk, user_id);


--
-- TOC entry 3392 (class 2606 OID 17291)
-- Name: proposal_events proposal_events_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_events
    ADD CONSTRAINT proposal_events_pkey PRIMARY KEY (proposal_pk);


--
-- TOC entry 3382 (class 2606 OID 17205)
-- Name: proposal_statuses proposal_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_statuses
    ADD CONSTRAINT proposal_statuses_pkey PRIMARY KEY (proposal_status_id);


--
-- TOC entry 3309 (class 2606 OID 16525)
-- Name: proposal_user proposal_user_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_user
    ADD CONSTRAINT proposal_user_pkey PRIMARY KEY (proposal_pk, user_id);


--
-- TOC entry 3386 (class 2606 OID 17221)
-- Name: proposal_workflow_connections proposal_workflow_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflow_connections
    ADD CONSTRAINT proposal_workflow_connections_pkey PRIMARY KEY (proposal_workflow_connection_id);


--
-- TOC entry 3384 (class 2606 OID 17213)
-- Name: proposal_workflows proposal_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflows
    ADD CONSTRAINT proposal_workflows_pkey PRIMARY KEY (proposal_workflow_id);


--
-- TOC entry 3290 (class 2606 OID 16434)
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (proposal_pk);


--
-- TOC entry 3293 (class 2606 OID 17571)
-- Name: proposals proposals_short_code_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_short_code_key UNIQUE (proposal_id);


--
-- TOC entry 3295 (class 2606 OID 16445)
-- Name: question_datatypes question_datatypes_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.question_datatypes
    ADD CONSTRAINT question_datatypes_pkey PRIMARY KEY (question_datatype_id);


--
-- TOC entry 3404 (class 2606 OID 17443)
-- Name: question_dependencies question_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.question_dependencies
    ADD CONSTRAINT question_dependencies_pkey PRIMARY KEY (question_dependency_id);


--
-- TOC entry 3365 (class 2606 OID 17005)
-- Name: questionaries questionaries_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questionaries
    ADD CONSTRAINT questionaries_pkey PRIMARY KEY (questionary_id);


--
-- TOC entry 3367 (class 2606 OID 17503)
-- Name: questions_has_template questions_has_template_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions_has_template
    ADD CONSTRAINT questions_has_template_pkey PRIMARY KEY (template_id, question_id);


--
-- TOC entry 3300 (class 2606 OID 16746)
-- Name: questions questions_natural_key_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_natural_key_key UNIQUE (natural_key);


--
-- TOC entry 3302 (class 2606 OID 16469)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 3313 (class 2606 OID 16929)
-- Name: role_user role_user_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_user_id);


--
-- TOC entry 3311 (class 2606 OID 16543)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 3377 (class 2606 OID 17145)
-- Name: samples samples_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_pkey PRIMARY KEY (sample_id);


--
-- TOC entry 3380 (class 2606 OID 17147)
-- Name: samples samples_questionary_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_questionary_id_key UNIQUE (questionary_id);


--
-- TOC entry 3416 (class 2606 OID 17600)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (settings_id);


--
-- TOC entry 3402 (class 2606 OID 17501)
-- Name: shipments_has_samples shipments_has_samples_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments_has_samples
    ADD CONSTRAINT shipments_has_samples_pkey PRIMARY KEY (shipment_id, sample_id);


--
-- TOC entry 3398 (class 2606 OID 17384)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (shipment_id);


--
-- TOC entry 3343 (class 2606 OID 17493)
-- Name: technical_review technical_review_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.technical_review
    ADD CONSTRAINT technical_review_pkey PRIMARY KEY (technical_review_id);


--
-- TOC entry 3345 (class 2606 OID 16739)
-- Name: technical_review technical_review_proposal_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.technical_review
    ADD CONSTRAINT technical_review_proposal_id_key UNIQUE (proposal_pk);


--
-- TOC entry 3363 (class 2606 OID 16996)
-- Name: template_categories template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_pkey PRIMARY KEY (template_category_id);


--
-- TOC entry 3356 (class 2606 OID 16900)
-- Name: templates_has_questions templates_has_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates_has_questions
    ADD CONSTRAINT templates_has_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 3354 (class 2606 OID 16865)
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (template_id);


--
-- TOC entry 3327 (class 2606 OID 16633)
-- Name: topic_completenesses topic_completenesses_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topic_completenesses
    ADD CONSTRAINT topic_completenesses_pkey PRIMARY KEY (questionary_id, topic_id);


--
-- TOC entry 3297 (class 2606 OID 16457)
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (topic_id);


--
-- TOC entry 3390 (class 2606 OID 17548)
-- Name: status_changing_events unique_connection_event; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.status_changing_events
    ADD CONSTRAINT unique_connection_event UNIQUE (proposal_workflow_connection_id, status_changing_event);


--
-- TOC entry 3410 (class 2606 OID 17491)
-- Name: units units_unit_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_unit_id_key UNIQUE (unit_id);


--
-- TOC entry 3359 (class 2606 OID 16902)
-- Name: templates_has_questions unq_question_id_template_id; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates_has_questions
    ADD CONSTRAINT unq_question_id_template_id UNIQUE (question_id, template_id);


--
-- TOC entry 3315 (class 2606 OID 17534)
-- Name: role_user user_role_unique_idx; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT user_role_unique_idx UNIQUE (user_id, role_id);


--
-- TOC entry 3284 (class 2606 OID 16685)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3286 (class 2606 OID 16415)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3288 (class 2606 OID 16682)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3418 (class 2606 OID 17617)
-- Name: visits visitations_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visitations_pkey PRIMARY KEY (visit_id);


--
-- TOC entry 3307 (class 1259 OID 17064)
-- Name: answers_questionary_id_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX answers_questionary_id_idx ON public.answers USING btree (questionary_id);


--
-- TOC entry 3291 (class 1259 OID 17572)
-- Name: proposals_short_code_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE UNIQUE INDEX proposals_short_code_idx ON public.proposals USING btree (proposal_id);


--
-- TOC entry 3378 (class 1259 OID 17368)
-- Name: samples_proposal_id_question_id_mm_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX samples_proposal_id_question_id_mm_idx ON public.samples USING btree (proposal_pk, question_id);


--
-- TOC entry 3352 (class 1259 OID 17066)
-- Name: templates_category_id_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX templates_category_id_idx ON public.templates USING btree (category_id);


--
-- TOC entry 3357 (class 1259 OID 17065)
-- Name: templates_has_questions_template_id_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX templates_has_questions_template_id_idx ON public.templates_has_questions USING btree (template_id);


--
-- TOC entry 3328 (class 1259 OID 17062)
-- Name: topic_completenesses_questionary_id_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX topic_completenesses_questionary_id_idx ON public.topic_completenesses USING btree (questionary_id);


--
-- TOC entry 3298 (class 1259 OID 17063)
-- Name: topics_template_id_idx; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX topics_template_id_idx ON public.topics USING btree (template_id);


--
-- TOC entry 3329 (class 1259 OID 16644)
-- Name: ux_proposal_topic_completenesses_proposal_id; Type: INDEX; Schema: public; Owner: duouser
--

CREATE INDEX ux_proposal_topic_completenesses_proposal_id ON public.topic_completenesses USING btree (questionary_id);


--
-- TOC entry 3419 (class 1259 OID 17680)
-- Name: visits_proposal_pk; Type: INDEX; Schema: public; Owner: duouser
--

CREATE UNIQUE INDEX visits_proposal_pk ON public.visits USING btree (proposal_pk);


--
-- TOC entry 3504 (class 2620 OID 17587)
-- Name: proposals proposal_delete_trigger; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER proposal_delete_trigger AFTER DELETE ON public.proposals FOR EACH ROW EXECUTE PROCEDURE public.after_proposal_delete();


--
-- TOC entry 3506 (class 2620 OID 17589)
-- Name: samples sample_delete_trigger; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER sample_delete_trigger AFTER DELETE ON public.samples FOR EACH ROW EXECUTE PROCEDURE public.after_sample_delete();


--
-- TOC entry 3503 (class 2620 OID 16440)
-- Name: proposals set_timestamp; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- TOC entry 3505 (class 2620 OID 16480)
-- Name: questions set_timestamp; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- TOC entry 3502 (class 2620 OID 16420)
-- Name: users set_timestamp; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- TOC entry 3507 (class 2620 OID 17591)
-- Name: shipments shipment_delete_trigger; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER shipment_delete_trigger AFTER DELETE ON public.shipments FOR EACH ROW EXECUTE PROCEDURE public.after_shipment_delete();


--
-- TOC entry 3449 (class 2606 OID 16784)
-- Name: SEP_Assignments SEP_Assignments_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Assignments"
    ADD CONSTRAINT "SEP_Assignments_proposal_id_fkey" FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk);


--
-- TOC entry 3451 (class 2606 OID 16794)
-- Name: SEP_Assignments SEP_Assignments_sep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Assignments"
    ADD CONSTRAINT "SEP_Assignments_sep_id_fkey" FOREIGN KEY (sep_id) REFERENCES public."SEPs"(sep_id);


--
-- TOC entry 3452 (class 2606 OID 16834)
-- Name: SEP_Assignments SEP_Assignments_sep_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Assignments"
    ADD CONSTRAINT "SEP_Assignments_sep_id_fkey1" FOREIGN KEY (sep_id) REFERENCES public."SEPs"(sep_id);


--
-- TOC entry 3450 (class 2606 OID 16789)
-- Name: SEP_Assignments SEP_Assignments_sep_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Assignments"
    ADD CONSTRAINT "SEP_Assignments_sep_member_user_id_fkey" FOREIGN KEY (sep_member_user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3457 (class 2606 OID 16967)
-- Name: SEP_Proposals SEP_Proposals_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Proposals"
    ADD CONSTRAINT "SEP_Proposals_proposal_id_fkey" FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk);


--
-- TOC entry 3458 (class 2606 OID 16972)
-- Name: SEP_Proposals SEP_Proposals_sep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Proposals"
    ADD CONSTRAINT "SEP_Proposals_sep_id_fkey" FOREIGN KEY (sep_id) REFERENCES public."SEPs"(sep_id);


--
-- TOC entry 3493 (class 2606 OID 17518)
-- Name: SEP_Reviewers SEP_Reviewers_sep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviewers"
    ADD CONSTRAINT "SEP_Reviewers_sep_id_fkey" FOREIGN KEY (sep_id) REFERENCES public."SEPs"(sep_id) ON DELETE CASCADE;


--
-- TOC entry 3492 (class 2606 OID 17513)
-- Name: SEP_Reviewers SEP_Reviewers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviewers"
    ADD CONSTRAINT "SEP_Reviewers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3439 (class 2606 OID 16979)
-- Name: SEP_Reviews SEP_Reviews_sep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviews"
    ADD CONSTRAINT "SEP_Reviews_sep_id_fkey" FOREIGN KEY (sep_id) REFERENCES public."SEPs"(sep_id);


--
-- TOC entry 3494 (class 2606 OID 17559)
-- Name: SEP_meeting_decisions SEP_meeting_decisions_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_meeting_decisions"
    ADD CONSTRAINT "SEP_meeting_decisions_proposal_id_fkey" FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;


--
-- TOC entry 3495 (class 2606 OID 17564)
-- Name: SEP_meeting_decisions SEP_meeting_decisions_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_meeting_decisions"
    ADD CONSTRAINT "SEP_meeting_decisions_submitted_by_fkey" FOREIGN KEY (submitted_by) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- TOC entry 3447 (class 2606 OID 17523)
-- Name: SEPs SEPs_sep_chair_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEPs"
    ADD CONSTRAINT "SEPs_sep_chair_user_id_fkey" FOREIGN KEY (sep_chair_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3448 (class 2606 OID 17528)
-- Name: SEPs SEPs_sep_secretary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEPs"
    ADD CONSTRAINT "SEPs_sep_secretary_user_id_fkey" FOREIGN KEY (sep_secretary_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3485 (class 2606 OID 17410)
-- Name: active_templates active_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.active_templates
    ADD CONSTRAINT active_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.template_categories(template_category_id);


--
-- TOC entry 3486 (class 2606 OID 17415)
-- Name: active_templates active_templates_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.active_templates
    ADD CONSTRAINT active_templates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);


--
-- TOC entry 3431 (class 2606 OID 16500)
-- Name: answers answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- TOC entry 3432 (class 2606 OID 17051)
-- Name: answers answers_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;


--
-- TOC entry 3464 (class 2606 OID 17089)
-- Name: call_has_instruments call_has_instrument_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call_has_instruments
    ADD CONSTRAINT call_has_instrument_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(call_id) ON UPDATE CASCADE;


--
-- TOC entry 3465 (class 2606 OID 17094)
-- Name: call_has_instruments call_has_instrument_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call_has_instruments
    ADD CONSTRAINT call_has_instrument_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE;


--
-- TOC entry 3441 (class 2606 OID 17268)
-- Name: call call_proposal_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_proposal_workflow_id_fkey FOREIGN KEY (proposal_workflow_id) REFERENCES public.proposal_workflows(proposal_workflow_id);


--
-- TOC entry 3440 (class 2606 OID 16885)
-- Name: call call_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);


--
-- TOC entry 3446 (class 2606 OID 16849)
-- Name: event_logs event_logs_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3466 (class 2606 OID 17104)
-- Name: instrument_has_proposals instrument_has_proposals_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instrument_has_proposals
    ADD CONSTRAINT instrument_has_proposals_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE;


--
-- TOC entry 3467 (class 2606 OID 17535)
-- Name: instrument_has_proposals instrument_has_proposals_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instrument_has_proposals
    ADD CONSTRAINT instrument_has_proposals_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3468 (class 2606 OID 17124)
-- Name: instrument_has_scientists instrument_has_scientists_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instrument_has_scientists
    ADD CONSTRAINT instrument_has_scientists_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instruments(instrument_id) ON UPDATE CASCADE;


--
-- TOC entry 3469 (class 2606 OID 17129)
-- Name: instrument_has_scientists instrument_has_scientists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instrument_has_scientists
    ADD CONSTRAINT instrument_has_scientists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- TOC entry 3463 (class 2606 OID 17602)
-- Name: instruments instruments_manager_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.instruments
    ADD CONSTRAINT instruments_manager_user_id_fkey FOREIGN KEY (manager_user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3479 (class 2606 OID 17261)
-- Name: status_changing_events next_status_events_proposal_workflow_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.status_changing_events
    ADD CONSTRAINT next_status_events_proposal_workflow_connection_id_fkey FOREIGN KEY (proposal_workflow_connection_id) REFERENCES public.proposal_workflow_connections(proposal_workflow_connection_id) ON DELETE CASCADE;


--
-- TOC entry 3480 (class 2606 OID 17292)
-- Name: proposal_events proposal_events_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_events
    ADD CONSTRAINT proposal_events_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;


--
-- TOC entry 3434 (class 2606 OID 16660)
-- Name: proposal_user proposal_user_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_user
    ADD CONSTRAINT proposal_user_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;


--
-- TOC entry 3433 (class 2606 OID 16531)
-- Name: proposal_user proposal_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_user
    ADD CONSTRAINT proposal_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- TOC entry 3477 (class 2606 OID 17232)
-- Name: proposal_workflow_connections proposal_workflow_connections_next_proposal_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflow_connections
    ADD CONSTRAINT proposal_workflow_connections_next_proposal_status_id_fkey FOREIGN KEY (next_proposal_status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;


--
-- TOC entry 3478 (class 2606 OID 17237)
-- Name: proposal_workflow_connections proposal_workflow_connections_prev_proposal_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflow_connections
    ADD CONSTRAINT proposal_workflow_connections_prev_proposal_status_id_fkey FOREIGN KEY (prev_proposal_status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;


--
-- TOC entry 3476 (class 2606 OID 17227)
-- Name: proposal_workflow_connections proposal_workflow_connections_proposal_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflow_connections
    ADD CONSTRAINT proposal_workflow_connections_proposal_status_id_fkey FOREIGN KEY (proposal_status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;


--
-- TOC entry 3475 (class 2606 OID 17222)
-- Name: proposal_workflow_connections proposal_workflow_connections_proposal_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_workflow_connections
    ADD CONSTRAINT proposal_workflow_connections_proposal_workflow_id_fkey FOREIGN KEY (proposal_workflow_id) REFERENCES public.proposal_workflows(proposal_workflow_id) ON DELETE CASCADE;


--
-- TOC entry 3423 (class 2606 OID 16868)
-- Name: proposals proposals_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(call_id);


--
-- TOC entry 3425 (class 2606 OID 17243)
-- Name: proposals proposals_proposal_statuses_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_proposal_statuses_id_fkey FOREIGN KEY (status_id) REFERENCES public.proposal_statuses(proposal_status_id) ON DELETE CASCADE;


--
-- TOC entry 3422 (class 2606 OID 16435)
-- Name: proposals proposals_proposer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3424 (class 2606 OID 17039)
-- Name: proposals proposals_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id);


--
-- TOC entry 3427 (class 2606 OID 17687)
-- Name: proposals proposals_risk_assessment_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_risk_assessment_questionary_id_fkey FOREIGN KEY (risk_assessment_questionary_id) REFERENCES public.questionaries(questionary_id);


--
-- TOC entry 3426 (class 2606 OID 17646)
-- Name: proposals proposals_technical_review_assignee_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_technical_review_assignee_fkey FOREIGN KEY (technical_review_assignee) REFERENCES public.users(user_id);


--
-- TOC entry 3491 (class 2606 OID 17454)
-- Name: question_dependencies question_dependencies_dependency_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.question_dependencies
    ADD CONSTRAINT question_dependencies_dependency_question_id_fkey FOREIGN KEY (dependency_question_id) REFERENCES public.questions(question_id);


--
-- TOC entry 3490 (class 2606 OID 17449)
-- Name: question_dependencies question_dependencies_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.question_dependencies
    ADD CONSTRAINT question_dependencies_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- TOC entry 3489 (class 2606 OID 17444)
-- Name: question_dependencies question_dependencies_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.question_dependencies
    ADD CONSTRAINT question_dependencies_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;


--
-- TOC entry 3460 (class 2606 OID 17114)
-- Name: questionaries questionaries_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questionaries
    ADD CONSTRAINT questionaries_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);


--
-- TOC entry 3459 (class 2606 OID 17006)
-- Name: questionaries questionaries_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questionaries
    ADD CONSTRAINT questionaries_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);


--
-- TOC entry 3429 (class 2606 OID 17068)
-- Name: questions questions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.template_categories(template_category_id);


--
-- TOC entry 3430 (class 2606 OID 17297)
-- Name: questions questions_data_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_data_type_fkey FOREIGN KEY (data_type) REFERENCES public.question_datatypes(question_datatype_id) ON UPDATE CASCADE;


--
-- TOC entry 3462 (class 2606 OID 17032)
-- Name: questions_has_template questions_has_template_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions_has_template
    ADD CONSTRAINT questions_has_template_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- TOC entry 3461 (class 2606 OID 17027)
-- Name: questions_has_template questions_has_template_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.questions_has_template
    ADD CONSTRAINT questions_has_template_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id);


--
-- TOC entry 3438 (class 2606 OID 16577)
-- Name: SEP_Reviews reviews_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviews"
    ADD CONSTRAINT reviews_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON UPDATE CASCADE;


--
-- TOC entry 3437 (class 2606 OID 16572)
-- Name: SEP_Reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public."SEP_Reviews"
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- TOC entry 3435 (class 2606 OID 16549)
-- Name: role_user role_user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE;


--
-- TOC entry 3436 (class 2606 OID 16844)
-- Name: role_user role_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3470 (class 2606 OID 17148)
-- Name: samples samples_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);


--
-- TOC entry 3472 (class 2606 OID 17307)
-- Name: samples samples_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;


--
-- TOC entry 3473 (class 2606 OID 17313)
-- Name: samples samples_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 3471 (class 2606 OID 17153)
-- Name: samples samples_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;


--
-- TOC entry 3474 (class 2606 OID 17400)
-- Name: samples samples_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.template_categories(template_category_id);


--
-- TOC entry 3483 (class 2606 OID 17395)
-- Name: shipments shipments_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);


--
-- TOC entry 3488 (class 2606 OID 17428)
-- Name: shipments_has_samples shipments_has_samples_sample_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments_has_samples
    ADD CONSTRAINT shipments_has_samples_sample_id_fkey FOREIGN KEY (sample_id) REFERENCES public.samples(sample_id) ON DELETE CASCADE;


--
-- TOC entry 3487 (class 2606 OID 17423)
-- Name: shipments_has_samples shipments_has_samples_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments_has_samples
    ADD CONSTRAINT shipments_has_samples_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(shipment_id) ON DELETE CASCADE;


--
-- TOC entry 3481 (class 2606 OID 17385)
-- Name: shipments shipments_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;


--
-- TOC entry 3482 (class 2606 OID 17390)
-- Name: shipments shipments_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id);


--
-- TOC entry 3484 (class 2606 OID 17692)
-- Name: shipments shipments_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(visit_id);


--
-- TOC entry 3444 (class 2606 OID 16740)
-- Name: technical_review technical_review_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.technical_review
    ADD CONSTRAINT technical_review_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3445 (class 2606 OID 17652)
-- Name: technical_review technical_review_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.technical_review
    ADD CONSTRAINT technical_review_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3453 (class 2606 OID 17057)
-- Name: templates templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.template_categories(template_category_id);


--
-- TOC entry 3456 (class 2606 OID 17664)
-- Name: templates_has_questions templates_has_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates_has_questions
    ADD CONSTRAINT templates_has_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON UPDATE CASCADE;


--
-- TOC entry 3454 (class 2606 OID 16908)
-- Name: templates_has_questions templates_has_questions_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates_has_questions
    ADD CONSTRAINT templates_has_questions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;


--
-- TOC entry 3455 (class 2606 OID 16913)
-- Name: templates_has_questions templates_has_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.templates_has_questions
    ADD CONSTRAINT templates_has_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- TOC entry 3443 (class 2606 OID 17045)
-- Name: topic_completenesses topic_completenesses_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topic_completenesses
    ADD CONSTRAINT topic_completenesses_questionary_id_fkey FOREIGN KEY (questionary_id) REFERENCES public.questionaries(questionary_id) ON DELETE CASCADE;


--
-- TOC entry 3442 (class 2606 OID 16639)
-- Name: topic_completenesses topic_completenesses_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topic_completenesses
    ADD CONSTRAINT topic_completenesses_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id);


--
-- TOC entry 3428 (class 2606 OID 16984)
-- Name: topics topics_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(template_id) ON DELETE CASCADE;


--
-- TOC entry 3421 (class 2606 OID 16720)
-- Name: users users_nationality_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_nationality_fkey FOREIGN KEY (nationality) REFERENCES public.nationalities(nationality_id);


--
-- TOC entry 3420 (class 2606 OID 16715)
-- Name: users users_organisation_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organisation_fkey FOREIGN KEY (organisation) REFERENCES public.institutions(institution_id);


--
-- TOC entry 3500 (class 2606 OID 17641)
-- Name: visits_has_users visitations_has_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits_has_users
    ADD CONSTRAINT visitations_has_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3499 (class 2606 OID 17636)
-- Name: visits_has_users visitations_has_users_visitation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits_has_users
    ADD CONSTRAINT visitations_has_users_visitation_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(visit_id) ON DELETE CASCADE;


--
-- TOC entry 3496 (class 2606 OID 17618)
-- Name: visits visitations_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visitations_proposal_id_fkey FOREIGN KEY (proposal_pk) REFERENCES public.proposals(proposal_pk) ON DELETE CASCADE;


--
-- TOC entry 3497 (class 2606 OID 17628)
-- Name: visits visitations_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visitations_visitor_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id);


--
-- TOC entry 3501 (class 2606 OID 17681)
-- Name: visits_has_users visits_has_users_registration_questionary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits_has_users
    ADD CONSTRAINT visits_has_users_registration_questionary_id_fkey FOREIGN KEY (registration_questionary_id) REFERENCES public.questionaries(questionary_id);


--
-- TOC entry 3498 (class 2606 OID 17675)
-- Name: visits visits_team_lead_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_team_lead_user_id_fkey FOREIGN KEY (team_lead_user_id) REFERENCES public.users(user_id);





    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
