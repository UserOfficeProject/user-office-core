--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
-- Dumped by pg_dump version 11.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
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

SET default_with_oids = false;

--
-- Name: call; Type: TABLE; Schema: public; Owner: duouser
--

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

--
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
-- Name: call_call_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.call_call_id_seq OWNED BY public.call.call_id;


--
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
-- Name: files; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.files (
    file_id bigint DEFAULT public.file_id_pseudo_encrypt(nextval('public.files_file_id_seq'::regclass)) NOT NULL,
    file_name character varying(512) NOT NULL,
    size_in_bytes integer,
    mime_type character varying(64),
    oid integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.files OWNER TO duouser;

--
-- Name: pagetext; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.pagetext (
    pagetext_id integer NOT NULL,
    content text
);


ALTER TABLE public.pagetext OWNER TO duouser;

--
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
-- Name: pagetext_pagetext_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.pagetext_pagetext_id_seq OWNED BY public.pagetext.pagetext_id;


--
-- Name: proposal_answers; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_answers (
    answer_id integer NOT NULL,
    proposal_id integer NOT NULL,
    proposal_question_id character varying(64) NOT NULL,
    answer character varying(512),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.proposal_answers OWNER TO duouser;

--
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
-- Name: proposal_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_answers_answer_id_seq OWNED BY public.proposal_answers.answer_id;


--
-- Name: proposal_answers_files; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_answers_files (
    answer_id integer,
    file_id bigint
);


ALTER TABLE public.proposal_answers_files OWNER TO duouser;

--
-- Name: proposal_question_datatypes; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_question_datatypes (
    proposal_question_datatype_id character varying(64) NOT NULL
);


ALTER TABLE public.proposal_question_datatypes OWNER TO duouser;

--
-- Name: proposal_question_dependencies; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_question_dependencies (
    proposal_question_id character varying(64) NOT NULL,
    proposal_question_dependency character varying(64) NOT NULL,
    condition character varying(64) DEFAULT NULL::character varying
);


ALTER TABLE public.proposal_question_dependencies OWNER TO duouser;

--
-- Name: proposal_questions; Type: TABLE; Schema: public; Owner: duouser
--

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

--
-- Name: proposal_topics; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_topics (
    topic_id integer NOT NULL,
    topic_title character varying(32) NOT NULL,
    is_enabled boolean DEFAULT false,
    sort_order integer NOT NULL
);


ALTER TABLE public.proposal_topics OWNER TO duouser;

--
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
-- Name: proposal_topics_sort_order_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_topics_sort_order_seq OWNED BY public.proposal_topics.sort_order;


--
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
-- Name: proposal_topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposal_topics_topic_id_seq OWNED BY public.proposal_topics.topic_id;


--
-- Name: proposal_user; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.proposal_user (
    proposal_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.proposal_user OWNER TO duouser;

--
-- Name: proposals; Type: TABLE; Schema: public; Owner: duouser
--

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

--
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
-- Name: proposals_proposal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.proposals_proposal_id_seq OWNED BY public.proposals.proposal_id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: duouser
--

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

--
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
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: role_user; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.role_user (
    role_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.role_user OWNER TO duouser;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: duouser
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    short_code character varying(20) NOT NULL,
    title character varying(20) NOT NULL
);


ALTER TABLE public.roles OWNER TO duouser;

--
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
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: duouser
--

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
    orcidRefreshToken character varying(100) NOT NULL,
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

--
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
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: duouser
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: call call_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call ALTER COLUMN call_id SET DEFAULT nextval('public.call_call_id_seq'::regclass);


--
-- Name: pagetext pagetext_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.pagetext ALTER COLUMN pagetext_id SET DEFAULT nextval('public.pagetext_pagetext_id_seq'::regclass);


--
-- Name: proposal_answers answer_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.proposal_answers_answer_id_seq'::regclass);


--
-- Name: proposal_topics topic_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_topics ALTER COLUMN topic_id SET DEFAULT nextval('public.proposal_topics_topic_id_seq'::regclass);


--
-- Name: proposal_topics sort_order; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_topics ALTER COLUMN sort_order SET DEFAULT nextval('public.proposal_topics_sort_order_seq'::regclass);


--
-- Name: proposals proposal_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals ALTER COLUMN proposal_id SET DEFAULT nextval('public.proposals_proposal_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: 18605; Type: BLOB; Schema: -; Owner: duouser
--

SELECT pg_catalog.lo_create('18605');


ALTER LARGE OBJECT 18605 OWNER TO duouser;

--
-- Data for Name: call; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.call (call_id, call_short_code, start_call, end_call, start_review, end_review, start_notify, end_notify, cycle_comment, survey_comment) FROM stdin;
1	call 1	2019-01-01	2023-01-01	2019-01-01	2023-01-01	2019-01-01	2023-01-01	This is cycle comment	This is survey comment
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.files (file_id, file_name, size_in_bytes, mime_type, oid, created_at) FROM stdin;
3898573529235304961	Proposal Review.pdf	91658	application/pdf	18605	2019-10-16 12:41:38.939947+00
\.


--
-- Data for Name: pagetext; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.pagetext (pagetext_id, content) FROM stdin;
1	<h1 class="display-4" style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0.5rem; font-family: Titillium, 'Titillium Web', 'Helvetica Neue', sans-serif; font-weight: 300; line-height: 1.2; color: #293035; font-size: 3.5rem; caret-color: #293035; font-style: normal; font-variant-caps: normal; letter-spacing: normal; orphans: auto; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration: none;">Welcome</h1>\n<p class="lead" style="box-sizing: border-box; margin-top: 0px; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 300; caret-color: #293035; color: #293035; font-family: Titillium, 'Titillium Web', 'Helvetica Neue', sans-serif; font-style: normal; font-variant-caps: normal; letter-spacing: normal; orphans: auto; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration: none;">to the DEMAX user portal for deuteration &amp; crystallization support!</p>\n<hr class="my-4" style="box-sizing: content-box; height: 0px; overflow: visible; margin-top: 1.5rem !important; margin-bottom: 1.5rem !important; border-width: 1px 0px 0px; border-top-style: solid; border-top-color: rgba(0, 0, 0, 0.0980392); caret-color: #293035; color: #293035; font-family: Titillium, 'Titillium Web', 'Helvetica Neue', sans-serif; font-size: 16px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration: none;" />\n<p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 1rem; caret-color: #293035; color: #293035; font-family: Titillium, 'Titillium Web', 'Helvetica Neue', sans-serif; font-size: 16px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration: none;">Users are strongly encouraged to contact DEMAX staff prior to preparing and submitting a deuteration/crystallization proposal.<span class="Apple-converted-space">&nbsp;</span><br style="box-sizing: border-box;" />General enquiries can be sent to:<span class="Apple-converted-space">&nbsp;</span><a style="box-sizing: border-box; color: #007bff; text-decoration: none; background-color: transparent; text-decoration-skip: objects;" href="mailto:demax@esss.se">demax@esss.se</a><span class="Apple-converted-space">&nbsp;</span>or to one of the<a style="box-sizing: border-box; color: #007bff; text-decoration: none; background-color: transparent; text-decoration-skip: objects;" href="https://demax.esss.dk/contact"><span class="Apple-converted-space">&nbsp;</span>subject matter experts.</a></p>\n<ul style="box-sizing: border-box; margin-top: 0px; margin-bottom: 1rem; caret-color: #293035; color: #293035; font-family: Titillium, 'Titillium Web', 'Helvetica Neue', sans-serif; font-size: 16px; font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; background-color: #ffffff; text-decoration: none;">\n<li style="box-sizing: border-box;">Proposals should be written in English, properly referenced, and prepared in the<span class="Apple-converted-space">&nbsp;</span><a style="box-sizing: border-box; color: #007bff; text-decoration: none; background-color: transparent; text-decoration-skip: objects;" href="https://demaxapi.esss.dk/api/word/attachment">Word template</a>. Please keep to the 2 page limit, including Summary, Background (Science Case, Practical Consideration, References, Figures/Tables).<span class="Apple-converted-space">&nbsp;</span></li>\n<li style="box-sizing: border-box;">Access to DEMAX is granted on the basis of both a technical and a peer-review process.</li>\n<li style="box-sizing: border-box;">Proposals awarded during initial operations (2019-2022) will be free of charge. During formal user operations (beyond 2023) we reserve the right to ask for partial financial contributions towards consumables &amp; shipping costs.<span class="Apple-converted-space">&nbsp;</span></li>\n<li style="box-sizing: border-box;">During initial operations, we will not limit access to DEMAX based on ESS-membership. Beyond this period, we will respect the user access policy that will be applicable ESS-wide.<span class="Apple-converted-space">&nbsp;</span></li>\n<li style="box-sizing: border-box;">Biological and chemical deuteration proposals are run as a service but users for protein crystallization are welcome to come in person as well.<span class="Apple-converted-space">&nbsp;</span></li>\n<li class="str" style="box-sizing: border-box;"><em style="box-sizing: border-box;">Users should note that the contributions by DEMAX should be acknowledged in any publications containing materials obtained from us. For particularly challenging projects that require above average involvement from DEMAX, relevant DEMAX staff should be acknowledged through co-authorship of any subsequent publications.</em></li>\n</ul>
2	<h1>Frequently asked questions</h1>\n<h5 style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0.5rem; font-family: inherit; font-weight: 500; line-height: 1.2; color: inherit; font-size: 1.25rem;">I try to generate a PDF but get an error message, what am I doing wrong?<span class="Apple-converted-space">&nbsp;</span></h5>\n<p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 1rem;">Depending on what types of deuteration you chose and how you answered the form, a different number of attachments are required to upload before you can generate a PDF.<span class="Apple-converted-space">&nbsp;</span></p>\n<h5 style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0.5rem; font-family: inherit; font-weight: 500; line-height: 1.2; color: inherit; font-size: 1.25rem;">I try to submit the proposal it doesn't seem to work?<span class="Apple-converted-space">&nbsp;</span></h5>\n<p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0px;">Make sure that all required attachments have been uploaded and that all required questions in the form have been answered.</p>\n<p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0px;">&nbsp;</p>\n<p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 0px;"><span class="Apple-converted-space">&nbsp;<br /></span></p>
\.


--
-- Data for Name: proposal_answers; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_answers (answer_id, proposal_id, proposal_question_id, answer, created_at) FROM stdin;
15	1	biosafety_is_recombinant	{"value":""}	2019-10-16 11:14:06.341512+00
12	1	slide_select_deuteration	{"value":true}	2019-10-16 11:14:06.341407+00
9	1	is_biomass	{"value":""}	2019-10-16 11:14:06.339558+00
6	1	recombinant_protein	{"value":""}	2019-10-16 11:14:06.337591+00
17	1	biosafety_has_hazard_ligand	{"value":""}	2019-10-16 11:14:06.343632+00
41	1	chem_deu_structure_justification	{"value":""}	2019-10-16 12:59:40.350906+00
44	1	chem_deu_chem_structure	{"value":""}	2019-10-16 12:59:40.364055+00
42	1	chem_deu_prep_source	{"value":"no"}	2019-10-16 12:59:40.351668+00
1	1	has_links_with_industry	{"value":"no"}	2019-10-16 11:14:01.603382+00
40	1	links_with_industry	{"value":""}	2019-10-16 12:43:07.002082+00
2	1	is_student_proposal	{"value":"no"}	2019-10-16 11:14:01.60408+00
3	1	is_towards_degree	{"value":"no"}	2019-10-16 11:14:01.604748+00
4	1	final_delivery_date	{"value":"2019-10-28T12:17:00.000Z"}	2019-10-16 11:14:01.605076+00
5	1	final_delivery_date_motivation	{"value":""}	2019-10-16 11:14:01.606028+00
35	1	has_crystallization	{"value":true}	2019-10-16 12:41:41.406147+00
30	1	crystallization_molecule_name	{"value":""}	2019-10-16 12:41:41.400172+00
22	1	amino_seq	{"value":""}	2019-10-16 12:41:41.371186+00
21	1	doi_or_alike	{"value":""}	2019-10-16 12:41:41.366688+00
20	1	reference_file	{"value":"3898573529235304961"}	2019-10-16 12:41:41.365934+00
25	1	crystallization_cofactors_ligands	{"value":""}	2019-10-16 12:41:41.395783+00
18	1	biosafety_is_organism_active	{"value":""}	2019-10-16 11:14:06.344698+00
19	1	biosafety_explanation	{"value":""}	2019-10-16 11:14:06.344897+00
8	1	yeast_derived_lipid_amnt	{"value":""}	2019-10-16 11:14:06.339323+00
7	1	bio_deu_other	{"value":""}	2019-10-16 11:14:06.33909+00
10	1	biosafety_containment_level	{"value":""}	2019-10-16 11:14:06.33991+00
11	1	biosafety_has_risks	{"value":""}	2019-10-16 11:14:06.341158+00
14	1	biosafety_is_toxin	{"value":""}	2019-10-16 11:14:06.341984+00
13	1	biosafety_is_virulence	{"value":""}	2019-10-16 11:14:06.341627+00
16	1	biosafety_is_prion	{"value":""}	2019-10-16 11:14:06.343235+00
29	1	prec_composition	{"value":""}	2019-10-16 12:41:41.397807+00
26	1	crystallization_experience	{"value":""}	2019-10-16 12:41:41.3979+00
27	1	crystallization_time	{"value":""}	2019-10-16 12:41:41.398828+00
31	1	crystal_size	{"value":""}	2019-10-16 12:41:41.400714+00
28	1	typical_yield	{"value":""}	2019-10-16 12:41:41.399579+00
38	1	storage_conditions	{"value":""}	2019-10-16 12:41:41.418994+00
34	1	stability	{"value":""}	2019-10-16 12:41:41.40535+00
32	1	protein_buffer	{"value":""}	2019-10-16 12:41:41.400892+00
33	1	is_deuterated	{"value":""}	2019-10-16 12:41:41.402559+00
36	1	molecular_weight	{"value":""}	2019-10-16 12:41:41.407558+00
24	1	oligomerization_state	{"value":""}	2019-10-16 12:41:41.371799+00
23	1	pdb_id	{"value":""}	2019-10-16 12:41:41.366898+00
37	1	protein_concentration	{"value":""}	2019-10-16 12:41:41.417491+00
39	1	chem_deu_enabled	{"value":true}	2019-10-16 12:41:43.62617+00
47	1	chem_deu_molecule_name	{"value":"Many"}	2019-10-16 12:59:40.38017+00
45	1	chem_deu_amount	{"value":""}	2019-10-16 12:59:40.378941+00
46	1	chem_deu_amount_justification	{"value":""}	2019-10-16 12:59:40.37953+00
43	1	chem_deu_d_percentage	{"value":""}	2019-10-16 12:59:40.356605+00
48	4	has_links_with_industry	{"value":"yes"}	2019-10-17 15:02:13.063225+00
49	4	links_with_industry	{"value":"I have a friend who works in a company"}	2019-10-17 15:02:13.064523+00
50	4	is_student_proposal	{"value":"no"}	2019-10-17 15:02:13.065336+00
51	4	is_towards_degree	{"value":"no"}	2019-10-17 15:02:13.06616+00
52	4	final_delivery_date	{"value":"2019-10-18T15:05:00.000Z"}	2019-10-17 15:02:13.067412+00
53	4	final_delivery_date_motivation	{"value":"Because even tomorrow is not soon enough."}	2019-10-17 15:02:13.068185+00
54	4	biosafety_is_recombinant	{"value":"yes"}	2019-10-17 15:04:02.946803+00
55	4	slide_select_deuteration	{"value":true}	2019-10-17 15:04:02.948349+00
56	4	is_biomass	{"value":""}	2019-10-17 15:04:02.949235+00
57	4	recombinant_protein	{"value":true}	2019-10-17 15:04:02.950129+00
58	4	molecule_name_for_deuteration	{"value":"Aspartate decarboxylase"}	2019-10-17 15:04:02.950956+00
59	4	bio_deu_fasta	{"value":"1234"}	2019-10-17 15:04:02.951803+00
60	4	bio_deu_molecular_weight	{"value":"1000000000"}	2019-10-17 15:04:02.952675+00
61	4	bio_deu_oligomerization_state	{"value":"tetramer"}	2019-10-17 15:04:02.953467+00
62	4	bio_deu_cofactors_ligands	{"value":"no"}	2019-10-17 15:04:02.954241+00
63	4	bio_deu_origin	{"value":"E. Coli"}	2019-10-17 15:04:02.955028+00
64	4	biosafety_has_hazard_ligand	{"value":"no"}	2019-10-17 15:04:02.955779+00
65	4	biosafety_is_organism_active	{"value":""}	2019-10-17 15:04:02.95657+00
66	4	biosafety_explanation	{"value":""}	2019-10-17 15:04:02.957321+00
67	4	bio_deu_plasmid_provided	{"value":"no"}	2019-10-17 15:04:02.958109+00
68	4	bio_deu_material_amount	{"value":"1 metric ton"}	2019-10-17 15:04:02.958882+00
69	4	bio_deu_material_amount_justification	{"value":"I like this protein very much"}	2019-10-17 15:04:02.960152+00
70	4	bio_deu_d_lvl_req	{"value":"Partial (65-80% with unlabeled carbon source)"}	2019-10-17 15:04:02.96092+00
71	4	bio_deu_d_lvl_req_justification	{"value":""}	2019-10-17 15:04:02.961672+00
72	4	bio_deu_purification_need	{"value":"yes"}	2019-10-17 15:04:02.962435+00
73	4	bio_deu_has_expressed	{"value":"yes"}	2019-10-17 15:04:02.96317+00
74	4	bio_deu_typical_yield	{"value":"1mg per L"}	2019-10-17 15:04:02.963992+00
75	4	bio_deu_purification_done	{"value":"no"}	2019-10-17 15:04:02.964739+00
76	4	bio_deu_has_deuteration_experience	{"value":"no"}	2019-10-17 15:04:02.965492+00
77	4	yeast_derived_lipid_amnt	{"value":""}	2019-10-17 15:04:02.966245+00
78	4	bio_deu_other	{"value":""}	2019-10-17 15:04:02.967258+00
79	4	biosafety_containment_level	{"value":"L1"}	2019-10-17 15:04:02.967964+00
80	4	biosafety_has_risks	{"value":"no"}	2019-10-17 15:04:02.968629+00
81	4	biosafety_is_toxin	{"value":"no"}	2019-10-17 15:04:02.969276+00
82	4	biosafety_is_virulence	{"value":"no"}	2019-10-17 15:04:02.969947+00
83	4	biosafety_is_prion	{"value":"no"}	2019-10-17 15:04:02.970596+00
84	4	has_crystallization	{"value":true}	2019-10-17 15:05:25.206039+00
85	4	crystallization_molecule_name	{"value":"Aspartate decarboxylase"}	2019-10-17 15:05:25.207331+00
86	4	amino_seq	{"value":"1234"}	2019-10-17 15:05:25.208154+00
87	4	molecular_weight	{"value":"1000000"}	2019-10-17 15:05:25.208916+00
88	4	oligomerization_state	{"value":"tetramer"}	2019-10-17 15:05:25.209718+00
89	4	pdb_id	{"value":"1AW8"}	2019-10-17 15:05:25.210454+00
90	4	doi_or_alike	{"value":"sdkjbdakl;"}	2019-10-17 15:05:25.211272+00
91	4	reference_file	{"value":""}	2019-10-17 15:05:25.211952+00
92	4	crystallization_cofactors_ligands	{"value":"No"}	2019-10-17 15:05:25.212654+00
93	4	prec_composition	{"value":"Ammonium sulphate and water"}	2019-10-17 15:05:25.213339+00
94	4	crystallization_experience	{"value":"Vapour diffusion, 2uL drops, 20C"}	2019-10-17 15:05:25.214014+00
95	4	crystallization_time	{"value":"1 week"}	2019-10-17 15:05:25.214749+00
96	4	crystal_size	{"value":"200x200x200"}	2019-10-17 15:05:25.215431+00
97	4	typical_yield	{"value":""}	2019-10-17 15:05:25.216119+00
98	4	storage_conditions	{"value":""}	2019-10-17 15:05:25.216751+00
99	4	stability	{"value":""}	2019-10-17 15:05:25.217417+00
100	4	protein_buffer	{"value":""}	2019-10-17 15:05:25.218105+00
101	4	is_deuterated	{"value":""}	2019-10-17 15:05:25.218765+00
102	4	protein_concentration	{"value":""}	2019-10-17 15:05:25.219549+00
103	4	chem_deu_enabled	{"value":true}	2019-10-17 15:05:59.960073+00
104	4	chem_deu_molecule_name	{"value":"sugar"}	2019-10-17 15:05:59.961698+00
105	4	chem_deu_amount	{"value":"1 metric ton"}	2019-10-17 15:05:59.96313+00
106	4	chem_deu_amount_justification	{"value":"I like sugar"}	2019-10-17 15:05:59.963939+00
107	4	chem_deu_d_percentage	{"value":"100% all over"}	2019-10-17 15:05:59.965074+00
108	4	chem_deu_structure_justification	{"value":"I like to present a challenge"}	2019-10-17 15:05:59.965833+00
109	4	chem_deu_chem_structure	{"value":""}	2019-10-17 15:05:59.96722+00
110	4	chem_deu_prep_source	{"value":"no"}	2019-10-17 15:05:59.969522+00
111	4	text_input_1571323436286	{"value":"asdf"}	2019-10-17 15:06:31.970928+00
112	4	text_input_1571323780736	{"value":"dfasd"}	2019-10-17 15:06:31.972298+00
113	4	text_input_1571324064504	{"value":"asdf"}	2019-10-17 15:06:31.973227+00
114	4	file_upload_1571323955969	{"value":""}	2019-10-17 15:06:31.976611+00
124	5	will_provide_organism	{"value":false}	2019-10-18 08:03:36.846023+00
125	5	material_amount	{"value":""}	2019-10-18 08:03:36.846766+00
126	5	material_condition	{"value":""}	2019-10-18 08:03:36.847485+00
127	5	amount_justification	{"value":""}	2019-10-18 08:03:36.849374+00
128	5	rq_deuteration_level	{"value":""}	2019-10-18 08:03:36.852239+00
129	5	d_level_justification	{"value":""}	2019-10-18 08:03:36.855407+00
122	5	slide_select_deuteration	{"value":true}	2019-10-18 08:03:36.843518+00
123	5	is_biomass	{"value":false}	2019-10-18 08:03:36.844879+00
130	5	recombinant_protein	{"value":true}	2019-10-18 08:03:36.856092+00
160	5	molecule_name_for_deuteration	{"value":""}	2019-10-18 08:04:56.075919+00
132	5	biosafety_is_organism_active	{"value":""}	2019-10-18 08:03:36.857461+00
133	5	biosafety_explanation	{"value":""}	2019-10-18 08:03:36.858133+00
134	5	yeast_derived_lipid_amnt	{"value":false}	2019-10-18 08:03:36.858804+00
135	5	bio_deu_other	{"value":""}	2019-10-18 08:03:36.859455+00
136	5	biosafety_containment_level	{"value":"L1"}	2019-10-18 08:03:36.860309+00
137	5	biosafety_has_risks	{"value":"no"}	2019-10-18 08:03:36.861004+00
138	5	biosafety_is_toxin	{"value":"no"}	2019-10-18 08:03:36.861641+00
139	5	biosafety_is_virulence	{"value":"no"}	2019-10-18 08:03:36.862285+00
140	5	biosafety_is_prion	{"value":"no"}	2019-10-18 08:03:36.862918+00
141	5	has_crystallization	{"value":true}	2019-10-18 08:04:35.105687+00
144	5	molecular_weight	{"value":""}	2019-10-18 08:04:35.111621+00
145	5	oligomerization_state	{"value":""}	2019-10-18 08:04:35.112339+00
146	5	pdb_id	{"value":""}	2019-10-18 08:04:35.113061+00
147	5	doi_or_alike	{"value":""}	2019-10-18 08:04:35.113777+00
148	5	reference_file	{"value":""}	2019-10-18 08:04:35.114453+00
149	5	crystallization_cofactors_ligands	{"value":""}	2019-10-18 08:04:35.115119+00
150	5	prec_composition	{"value":""}	2019-10-18 08:04:35.115728+00
151	5	crystallization_experience	{"value":""}	2019-10-18 08:04:35.116366+00
152	5	crystallization_time	{"value":""}	2019-10-18 08:04:35.119152+00
153	5	crystal_size	{"value":""}	2019-10-18 08:04:35.121194+00
154	5	typical_yield	{"value":""}	2019-10-18 08:04:35.12192+00
155	5	storage_conditions	{"value":""}	2019-10-18 08:04:35.122601+00
156	5	stability	{"value":""}	2019-10-18 08:04:35.126558+00
157	5	protein_buffer	{"value":""}	2019-10-18 08:04:35.127368+00
158	5	is_deuterated	{"value":""}	2019-10-18 08:04:35.128569+00
159	5	protein_concentration	{"value":""}	2019-10-18 08:04:35.129284+00
117	5	is_student_proposal	{"value":"no"}	2019-10-18 07:58:01.195012+00
118	5	is_towards_degree	{"value":"no"}	2019-10-18 07:58:01.196351+00
143	5	amino_seq	{"value":""}	2019-10-18 08:04:35.110784+00
120	5	final_delivery_date_motivation	{"value":"I NEED this material."}	2019-10-18 07:58:01.198407+00
115	5	has_links_with_industry	{"value":"no"}	2019-10-18 07:58:01.192019+00
116	5	links_with_industry	{"value":""}	2019-10-18 07:58:01.193989+00
121	5	biosafety_is_recombinant	{"value":""}	2019-10-18 08:03:36.842141+00
131	5	biosafety_has_hazard_ligand	{"value":"no"}	2019-10-18 08:03:36.85675+00
205	7	links_with_industry	{"value":"zdkfjb"}	2019-10-18 08:47:27.808013+00
206	7	is_student_proposal	{"value":"no"}	2019-10-18 08:47:27.808669+00
207	7	is_towards_degree	{"value":"no"}	2019-10-18 08:47:27.809376+00
208	7	final_delivery_date	{"value":"2019-10-22T08:51:00.000Z"}	2019-10-18 08:47:27.809992+00
209	7	final_delivery_date_motivation	{"value":"a.sdjf.skjd"}	2019-10-18 08:47:27.811081+00
226	8	final_delivery_date	{"value":"2019-10-22T09:23:00.000Z"}	2019-10-18 09:19:36.331985+00
119	5	final_delivery_date	{"value":"2020-01-10T09:01:00.000Z"}	2019-10-18 07:58:01.19736+00
161	5	bio_deu_fasta	{"value":""}	2019-10-18 08:04:56.077249+00
162	5	bio_deu_molecular_weight	{"value":""}	2019-10-18 08:04:56.078377+00
163	5	bio_deu_oligomerization_state	{"value":""}	2019-10-18 08:04:56.079091+00
164	5	bio_deu_cofactors_ligands	{"value":""}	2019-10-18 08:04:56.079762+00
165	5	bio_deu_origin	{"value":""}	2019-10-18 08:04:56.081054+00
166	5	bio_deu_plasmid_provided	{"value":"yes"}	2019-10-18 08:04:56.088163+00
167	5	bio_deu_material_amount	{"value":""}	2019-10-18 08:04:56.088882+00
168	5	bio_deu_material_amount_justification	{"value":""}	2019-10-18 08:04:56.089587+00
169	5	bio_deu_d_lvl_req	{"value":"Partial (65-80% with unlabeled carbon source)"}	2019-10-18 08:04:56.090251+00
170	5	bio_deu_d_lvl_req_justification	{"value":""}	2019-10-18 08:04:56.091723+00
171	5	bio_deu_purification_need	{"value":"no"}	2019-10-18 08:04:56.092487+00
172	5	bio_deu_has_expressed	{"value":"yes"}	2019-10-18 08:04:56.09319+00
173	5	bio_deu_typical_yield	{"value":"10"}	2019-10-18 08:04:56.093843+00
174	5	bio_deu_purification_done	{"value":"yes"}	2019-10-18 08:04:56.094514+00
175	5	bio_deu_has_deuteration_experience	{"value":"yes"}	2019-10-18 08:04:56.095166+00
142	5	crystallization_molecule_name	{"value":""}	2019-10-18 08:04:35.10884+00
176	5	chem_deu_enabled	{"value":true}	2019-10-18 08:06:35.691557+00
177	5	chem_deu_molecule_name	{"value":""}	2019-10-18 08:06:35.693301+00
178	5	chem_deu_amount	{"value":""}	2019-10-18 08:06:35.694036+00
179	5	chem_deu_amount_justification	{"value":""}	2019-10-18 08:06:35.694691+00
180	5	chem_deu_d_percentage	{"value":""}	2019-10-18 08:06:35.695377+00
181	5	chem_deu_structure_justification	{"value":""}	2019-10-18 08:06:35.69605+00
182	5	chem_deu_chem_structure	{"value":""}	2019-10-18 08:06:35.696715+00
183	5	chem_deu_prep_source	{"value":""}	2019-10-18 08:06:35.697392+00
184	6	has_links_with_industry	{"value":"no"}	2019-10-18 08:13:49.440126+00
185	6	links_with_industry	{"value":""}	2019-10-18 08:13:49.441513+00
186	6	is_student_proposal	{"value":"no"}	2019-10-18 08:13:49.442415+00
187	6	is_towards_degree	{"value":"no"}	2019-10-18 08:13:49.443302+00
188	6	final_delivery_date	{"value":"2019-10-18T08:17:00.000Z"}	2019-10-18 08:13:49.444896+00
189	6	final_delivery_date_motivation	{"value":"hwywhyryhh"}	2019-10-18 08:13:49.445736+00
190	6	slide_select_deuteration	{"value":""}	2019-10-18 08:13:52.114362+00
191	6	has_crystallization	{"value":""}	2019-10-18 08:13:52.803908+00
192	6	chem_deu_enabled	{"value":true}	2019-10-18 08:14:02.10555+00
193	6	chem_deu_molecule_name	{"value":""}	2019-10-18 08:14:02.106496+00
194	6	chem_deu_amount	{"value":""}	2019-10-18 08:14:02.110287+00
195	6	chem_deu_amount_justification	{"value":""}	2019-10-18 08:14:02.111084+00
196	6	chem_deu_d_percentage	{"value":""}	2019-10-18 08:14:02.127891+00
197	6	chem_deu_structure_justification	{"value":""}	2019-10-18 08:14:02.137898+00
198	6	chem_deu_chem_structure	{"value":""}	2019-10-18 08:14:02.139021+00
199	6	chem_deu_prep_source	{"value":""}	2019-10-18 08:14:02.139822+00
200	5	text_input_1571323436286	{"value":"not feeling it"}	2019-10-18 08:17:26.010611+00
201	5	text_input_1571323780736	{"value":"blah"}	2019-10-18 08:17:26.011953+00
202	5	text_input_1571324064504	{"value":"blah"}	2019-10-18 08:17:26.01277+00
203	5	file_upload_1571323955969	{"value":""}	2019-10-18 08:17:26.014366+00
227	8	final_delivery_date_motivation	{"value":"I need it badly"}	2019-10-18 09:19:36.332756+00
228	8	slide_select_deuteration	{"value":false}	2019-10-18 09:25:20.749204+00
229	8	yeast_derived_d_lvl_req	{"value":"Partial (65-80% with unlabeled carbon source)"}	2019-10-18 09:25:20.755142+00
222	8	has_links_with_industry	{"value":"no"}	2019-10-18 09:19:36.328407+00
223	8	links_with_industry	{"value":""}	2019-10-18 09:19:36.329561+00
224	8	is_student_proposal	{"value":"no"}	2019-10-18 09:19:36.330385+00
210	7	slide_select_deuteration	{"value":""}	2019-10-18 08:58:35.918755+00
211	7	is_biomass	{"value":false}	2019-10-18 08:58:35.921387+00
212	7	recombinant_protein	{"value":false}	2019-10-18 08:58:35.922234+00
213	7	yeast_derived_lipid_amnt	{"value":false}	2019-10-18 08:58:35.922989+00
214	7	yeast_derived_d_lvl_req	{"value":""}	2019-10-18 08:58:35.923823+00
215	7	biosafety_containment_level	{"value":"L2"}	2019-10-18 08:58:35.924603+00
216	7	biosafety_has_risks	{"value":"no"}	2019-10-18 08:58:35.926895+00
217	7	biosafety_is_organism_active	{"value":"as.dkjfh"}	2019-10-18 08:58:35.928415+00
218	7	biosafety_is_toxin	{"value":"no"}	2019-10-18 08:58:35.929198+00
219	7	biosafety_is_virulence	{"value":"no"}	2019-10-18 08:58:35.93526+00
220	7	biosafety_is_prion	{"value":"no"}	2019-10-18 08:58:35.937638+00
221	7	text_input_1571388053776	{"value":"as.djfh"}	2019-10-18 08:58:35.938498+00
204	7	has_links_with_industry	{"value":"no"}	2019-10-18 08:47:27.807017+00
230	8	has_crystallization	{"value":false}	2019-10-18 09:38:55.006114+00
225	8	is_towards_degree	{"value":"no"}	2019-10-18 09:19:36.331286+00
231	8	chem_deu_enabled	{"value":true}	2019-10-18 09:39:07.892446+00
232	8	chem_deu_molecule_name	{"value":"werf"}	2019-10-18 09:39:07.894052+00
235	8	chem_deu_amount	{"value":"asdf"}	2019-10-18 09:39:07.896433+00
237	8	chem_deu_amount_justification	{"value":"asdfsadfasdf"}	2019-10-18 09:39:07.897918+00
238	8	chem_deu_d_percentage	{"value":"asdfasdfasdf"}	2019-10-18 09:39:07.898602+00
239	8	chem_deu_structure_justification	{"value":"asdfasdfd"}	2019-10-18 09:39:07.899288+00
236	8	chem_deu_chem_structure	{"value":""}	2019-10-18 09:39:07.897205+00
233	8	chem_deu_prep_source	{"value":"no"}	2019-10-18 09:39:07.894837+00
234	8	chem_deu_protocol	{"value":""}	2019-10-18 09:39:07.89564+00
\.


--
-- Data for Name: proposal_answers_files; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_answers_files (answer_id, file_id) FROM stdin;
\.


--
-- Data for Name: proposal_question_datatypes; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_question_datatypes (proposal_question_datatype_id) FROM stdin;
TEXT_INPUT
SELECTION_FROM_OPTIONS
BOOLEAN
DATE
FILE_UPLOAD
EMBELLISHMENT
\.


--
-- Data for Name: proposal_question_dependencies; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_question_dependencies (proposal_question_id, proposal_question_dependency, condition) FROM stdin;
organism_name	is_biomass	{"condition":"eq","params":true}
will_provide_organism	is_biomass	{"condition":"eq","params":true}
material_amount	is_biomass	{"condition":"eq","params":true}
amount_justification	is_biomass	{"condition":"eq","params":true}
rq_deuteration_level	is_biomass	{"condition":"eq","params":true}
d_level_justification	is_biomass	{"condition":"eq","params":true}
reference_pdf	is_biomass	{"condition":"eq","params":true}
molecule_name_for_deuteration	recombinant_protein	{"condition":"eq","params":true}
bio_deu_fasta	recombinant_protein	{"condition":"eq","params":true}
bio_deu_molecular_weight	recombinant_protein	{"condition":"eq","params":true}
bio_deu_oligomerization_state	recombinant_protein	{"condition":"eq","params":true}
bio_deu_cofactors_ligands	recombinant_protein	{"condition":"eq","params":true}
bio_deu_origin	recombinant_protein	{"condition":"eq","params":true}
bio_deu_material_amount	recombinant_protein	{"condition":"eq","params":true}
bio_deu_material_amount_justification	recombinant_protein	{"condition":"eq","params":true}
bio_deu_d_lvl_req	recombinant_protein	{"condition":"eq","params":true}
bio_deu_d_lvl_req_justification	recombinant_protein	{"condition":"eq","params":true}
yeast_derived_d_lvl_req_justification	yeast_derived_lipid_amnt	{"condition":"eq","params":true}
bio_deu_has_expressed	recombinant_protein	{"condition":"eq","params":true}
crystallization_experience	has_crystallization	{"condition":"eq","params":true}
crystallization_time	has_crystallization	{"condition":"eq","params":true}
crystal_size	has_crystallization	{"condition":"eq","params":true}
ttl_biosafety	slide_select_deuteration	{"condition":"eq","params":true}
biosafety_containment_level	slide_select_deuteration	{"condition":"eq","params":true}
biosafety_has_risks	slide_select_deuteration	{"condition":"eq","params":true}
biosafety_is_organism_active	slide_select_deuteration	{"condition":"eq","params":true}
biosafety_is_toxin	slide_select_deuteration	{"condition":"eq","params":true}
biosafety_is_virulence	slide_select_deuteration	{"condition":"eq","params":true}
biosafety_is_prion	slide_select_deuteration	{"condition":"eq","params":true}
text_input_1571388053776	slide_select_deuteration	{"condition":"eq","params":true}
reference_file	has_crystallization	{"condition":"eq","params":true}
bio_deu_purification_need	recombinant_protein	{"condition":"eq","params":true}
bio_deu_typical_yield	recombinant_protein	{"condition":"eq","params":true}
bio_deu_has_deuteration_experience	recombinant_protein	{"condition":"eq","params":true}
yeast_derived_material_amount	yeast_derived_lipid_amnt	{"condition":"eq","params":true}
yeast_derived_material_amount_justification	yeast_derived_lipid_amnt	{"condition":"eq","params":true}
crystallization_molecule_name	has_crystallization	{"condition":"eq","params":true}
amino_seq	has_crystallization	{"condition":"eq","params":true}
molecular_weight	has_crystallization	{"condition":"eq","params":true}
oligomerization_state	has_crystallization	{"condition":"eq","params":true}
pdb_id	has_crystallization	{"condition":"eq","params":true}
ttl_details_for_prep	has_crystallization	{"condition":"eq","params":true}
crystallization_cofactors_ligands	has_crystallization	{"condition":"eq","params":true}
protein_concentration	has_crystallization	{"condition":"eq","params":true}
is_deuterated	has_crystallization	{"condition":"eq","params":true}
stability	has_crystallization	{"condition":"eq","params":true}
prec_composition	has_crystallization	{"condition":"eq","params":true}
ttl_select_deuteration_type	slide_select_deuteration	{"condition":"eq","params":true}
is_biomass	slide_select_deuteration	{"condition":"eq","params":true}
recombinant_protein	slide_select_deuteration	{"condition":"eq","params":true}
yeast_derived_lipid_amnt	slide_select_deuteration	{"condition":"eq","params":true}
\.


--
-- Data for Name: proposal_questions; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_questions (proposal_question_id, data_type, question, topic_id, config, sort_order, created_at, updated_at) FROM stdin;
ttl_general	EMBELLISHMENT		1	{"html":"<h2>Indicators</h2>", "plain": "Indicators"}	1	2019-10-16 11:04:58.041626+00	2019-10-16 12:42:39.877996+00
has_links_with_industry	SELECTION_FROM_OPTIONS	Links with industry?	1	{"required":true, "options":["yes", "no"], "variant":"radio"}	2	2019-10-16 11:04:58.041626+00	2019-10-16 12:42:39.884753+00
links_with_industry	TEXT_INPUT	If yes, please describe:	1	{"placeholder":"Please specify links with industry"}	3	2019-10-16 11:04:58.041626+00	2019-10-16 12:42:39.889582+00
is_towards_degree	SELECTION_FROM_OPTIONS	Does the proposal work towards a students degree?	1	{"required":true, "options":["yes", "no"], "variant":"radio"}	5	2019-10-16 11:04:58.041626+00	2019-10-16 12:42:39.900291+00
ttl_delivery_date	EMBELLISHMENT		1	{"html":"<h2>Final delivery date</h2>", "plain": "Final delivery date"}	6	2019-10-16 11:04:58.041626+00	2019-10-16 12:42:39.912067+00
reference_file	FILE_UPLOAD	Please attach a reference or protocol for crystallization conditions, crystal structure(s). 	2	{"max_files":3,"file_type":[]}	16	2019-10-16 11:04:58.041626+00	2019-10-18 09:25:44.63783+00
final_delivery_date	DATE	Choose a date	1	{"min":"now","required":true}	7	2019-10-16 11:04:58.041626+00	2019-10-18 09:24:58.570505+00
crystallization_time	TEXT_INPUT	How long do your crystals take to appear?	2	{"min":2,"max":200}	14	2019-10-16 11:04:58.041626+00	2019-10-18 09:15:01.013903+00
bio_deu_origin	TEXT_INPUT	Biological origin of protein:	3	{"placeholder":"(e.g. human, E. coli, S. cerevisiae)"}	18	2019-10-16 11:04:58.041626+00	2019-10-18 08:51:42.991645+00
molecule_name_for_deuteration	TEXT_INPUT	Name of protein to be deuterated:	3	{"placeholder":"(e.g. superoxide dismutase)"}	13	2019-10-16 11:04:58.041626+00	2019-10-18 08:50:53.861879+00
material_amount	TEXT_INPUT	How much material do you need (indicate wet or dry mass)	3	{"min":2,"max":200}	8	2019-10-16 11:04:58.041626+00	2019-10-18 08:49:55.7331+00
d_level_justification	TEXT_INPUT	Justify level of D incorporation	3	{"min":10,"max":500,"multiline":true}	11	2019-10-16 11:04:58.041626+00	2019-10-18 08:50:28.083785+00
bio_deu_cofactors_ligands	TEXT_INPUT	Does the protein have any co-factors or ligands required for folding/expression? Specify:	3	{"multiline":true}	17	2019-10-16 11:04:58.041626+00	2019-10-18 08:51:32.27118+00
bio_deu_molecular_weight	TEXT_INPUT	Molecular weight (kDA)	3	{}	15	2019-10-16 11:04:58.041626+00	2019-10-18 08:51:13.93047+00
crystal_size	TEXT_INPUT	What is the typical size of your crystal?	2	{"min":2,"max":200,"placeholder":"( µm x µm x µm )"}	15	2019-10-16 11:04:58.041626+00	2019-10-18 09:15:12.701128+00
bio_deu_fasta	TEXT_INPUT	FASTA sequence or Uniprot number	3	{}	14	2019-10-16 11:04:58.041626+00	2019-10-18 08:51:04.407253+00
has_crystallization	BOOLEAN	Is crystallization applicable	2	{"variant":"checkbox"}	1	2019-10-16 11:04:58.041626+00	2019-10-18 09:12:23.57651+00
is_biomass	BOOLEAN	Biomass (E. coli)	3	{"variant":"checkbox"}	3	2019-10-16 11:04:58.041626+00	2019-10-18 09:20:34.963402+00
bio_deu_oligomerization_state	TEXT_INPUT	Oligomerization state	3	{"placeholder":"(e.g. homodimer, tetramer etc.)"}	16	2019-10-16 11:04:58.041626+00	2019-10-18 08:51:22.841639+00
slide_select_deuteration	BOOLEAN	Is biological deuteration applicable	3	{"variant":"slider"}	1	2019-10-16 11:04:58.041626+00	2019-10-18 08:45:57.136705+00
final_delivery_date_motivation	TEXT_INPUT	Please motivate the chosen date	1	{"min":10,"multiline":true,"max":500,"placeholder":"(e.g. based on awarded beamtime, or described intention to apply)","required":true}	8	2019-10-16 11:04:58.041626+00	2019-10-18 09:24:52.077397+00
reference_pdf	FILE_UPLOAD	Please attach a reference or protocol of culture conditions and media composition	3	{"small_label":"Accepted formats: PDF","file_type":[".pdf"]}	12	2019-10-16 11:04:58.041626+00	2019-10-18 08:50:39.772551+00
will_provide_organism	BOOLEAN	Will user provide the organism for us to grow under deuterated conditions?	3	{"variant":"radio","options":["yes","no"]}	7	2019-10-16 11:04:58.041626+00	2019-10-18 08:49:10.099758+00
amount_justification	TEXT_INPUT	Justify the amount requested	3	{"min":10,"max":500,"multiline":true}	9	2019-10-16 11:04:58.041626+00	2019-10-18 08:50:05.89845+00
recombinant_protein	BOOLEAN	Recombinant protein (E. coli) (user supplies plasmid)	3	{"variant":"slider"}	4	2019-10-16 11:04:58.041626+00	2019-10-18 09:21:04.237596+00
stability	TEXT_INPUT	Stability and storage conditions (e.g. 2 months at 4 degrees Celsius)	2	{"min":2,"max":200}	11	2019-10-16 11:04:58.041626+00	2019-10-18 09:14:34.776276+00
crystallization_experience	TEXT_INPUT	What crystallization method, volume, and temperature have you used in the past?	2	{"multiline":true,"min":2,"max":500,"placeholder":"(e.g. vapour diffusion, 10 µL drops, room temperature)"}	13	2019-10-16 11:04:58.041626+00	2019-10-18 09:14:52.376515+00
material_condition	TEXT_INPUT	Indicate wet or dry mass	8	{"min":2, "max":5}	14	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.401278+00
crystallization_molecule_name	TEXT_INPUT	Name of molecule to be crystallized	2	{"min":2,"max":40,"placeholder":"(e.g. superoxide dismutase)"}	2	2019-10-16 11:04:58.041626+00	2019-10-18 09:13:05.309973+00
storage_conditions	TEXT_INPUT	Storage conditions:	8	{"min":2, "max":200,"placeholder":"(e.g. stable at 4 °C or frozen at -20 °C)"}	13	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.398119+00
protein_concentration	TEXT_INPUT	What protein concentration do you usually use for crystallization?	2	{"min":2,"max":200}	9	2019-10-16 11:04:58.041626+00	2019-10-18 09:14:15.602469+00
crystallization_cofactors_ligands	TEXT_INPUT	What is the composition of your protein solution (buffer, pH, co-factors, metals) prior to crystallization? Specify	2	{"min":2,"max":200}	8	2019-10-16 11:04:58.041626+00	2019-10-18 09:14:03.389435+00
oligomerization_state	TEXT_INPUT	Oligomerization state:	2	{"min":2,"max":200,"placeholder":"(e.g. homodimer, tetramer etc.)"}	5	2019-10-16 11:04:58.041626+00	2019-10-18 09:13:36.251892+00
pdb_id	TEXT_INPUT	PDB ID of crystal structure	2	{"min":2,"max":200}	6	2019-10-16 11:04:58.041626+00	2019-10-18 09:13:46.373752+00
ttl_details_for_prep	EMBELLISHMENT		2	{"html":"<h2>Crystallization Details</h2>","plain":"Crystallization Details"}	7	2019-10-16 11:04:58.041626+00	2019-10-18 09:13:54.983483+00
typical_yield	TEXT_INPUT	Typical yield:	8	{"min":2, "max":200, "placeholder":"(mg per liter of culture)"}	7	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.377707+00
prec_composition	TEXT_INPUT	Known crystallization precipitant composition:	2	{"min":2,"max":200,"placeholder":"(inc.buffer, salt, additives, pH)"}	12	2019-10-16 11:04:58.041626+00	2019-10-18 09:14:44.49808+00
ttl_crystallization	EMBELLISHMENT		8	{"html":"<h2>Crystallization</h2>","plain":"Crystallization"}	10	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.388472+00
is_deuterated	TEXT_INPUT	Is your protein partially or fully deuterated?	2	{"min":2,"max":200}	10	2019-10-16 11:04:58.041626+00	2019-10-18 09:14:25.89322+00
doi_or_alike	TEXT_INPUT	If the reference is publicly available, please provide the DOI or an accessible link:	8	{"min":2, "max":200}	12	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.39518+00
molecular_weight	TEXT_INPUT	Molecular weight (kDA):	2	{"min":2,"max":200}	4	2019-10-16 11:04:58.041626+00	2019-10-18 09:13:27.054699+00
protein_buffer	TEXT_INPUT	What buffer is your protein in?	8	{"min":2, "max":200}	9	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.384802+00
ttl_select_deuteration_type	EMBELLISHMENT		3	{"html":"<h3>Select deuteration type(s)</h3>","plain":"Select deuteration type(s)"}	2	2019-10-16 11:04:58.041626+00	2019-10-18 09:20:09.215065+00
amino_seq	TEXT_INPUT	FASTA sequence or Uniprot number:	2	{"min":2,"max":200}	3	2019-10-16 11:04:58.041626+00	2019-10-18 09:13:17.069007+00
organism_name	TEXT_INPUT	What is the organism?	3	{"min":2,"max":200}	6	2019-10-16 11:04:58.041626+00	2019-10-18 08:48:57.453061+00
is_student_proposal	SELECTION_FROM_OPTIONS	Are any of the co-proposers students?	1	{"required":true, "options":["yes", "no"], "variant":"radio"}	4	2019-10-16 11:04:58.041626+00	2019-10-16 12:42:39.89428+00
biosafety_has_hazard_ligand	SELECTION_FROM_OPTIONS	Does the sample have a hazardous ligand (e.g. heavy metal, toxic molecule etc.)? If so, what is it?	8	{"variant":"radio","options":["yes","no"]}	2	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.343689+00
bio_deu_purification_done	SELECTION_FROM_OPTIONS	Have you been able to purify the unlabeled protein?	8	{"variant":"radio","options":["yes","no"]}	5	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.365846+00
biosafety_is_toxin	SELECTION_FROM_OPTIONS	Is the sample a toxin?	3	{"variant":"radio","options":["yes","no"],"required":true}	35	2019-10-16 11:04:58.041626+00	2019-10-18 09:23:49.262903+00
biosafety_is_recombinant	SELECTION_FROM_OPTIONS	Is the protein recombinant?	8	{"variant":"radio", "options":["yes", "no"]}	1	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.301631+00
text_input_1571324064504	TEXT_INPUT	References	6	{"placeholder":"Please provide supporting references for the Science Case in Nature format.","multiline":true}	5	2019-10-17 14:50:42.732138+00	2019-10-18 09:35:47.360483+00
biosafety_is_prion	SELECTION_FROM_OPTIONS	Is the sample a prion protein?	3	{"variant":"radio","options":["yes","no"],"required":true}	37	2019-10-16 11:04:58.041626+00	2019-10-18 09:24:09.282775+00
bio_deu_material_amount	TEXT_INPUT	How much material do you need?	3	{}	19	2019-10-16 11:04:58.041626+00	2019-10-18 08:51:56.286304+00
bio_deu_material_amount_justification	TEXT_INPUT	Justify amount:	3	{}	20	2019-10-16 11:04:58.041626+00	2019-10-18 08:52:05.937936+00
bio_deu_purification_need	SELECTION_FROM_OPTIONS	Will you need DEMAX to purify the protein from deuterated biomass?	3	{"variant":"radio","options":["yes","no"]}	24	2019-10-16 11:04:58.041626+00	2019-10-18 08:53:15.080018+00
bio_deu_typical_yield	TEXT_INPUT	Typical yield:	3	{}	25	2019-10-16 11:04:58.041626+00	2019-10-18 08:53:25.136084+00
bio_deu_has_deuteration_experience	SELECTION_FROM_OPTIONS	Have you tried to deuterate the protein yourself, even in small scale?	3	{"variant":"radio","options":["yes","no"]}	26	2019-10-16 11:04:58.041626+00	2019-10-18 08:53:35.584632+00
yeast_derived_material_amount_justification	TEXT_INPUT	Justify amount	3	{"min":2,"max":200}	28	2019-10-16 11:04:58.041626+00	2019-10-18 08:54:08.802758+00
yeast_derived_material_amount	TEXT_INPUT	How much material do you need?	3	{"min":2,"max":200}	27	2019-10-16 11:04:58.041626+00	2019-10-18 08:53:56.502292+00
text_input_1571323436286	TEXT_INPUT	Background	6	{"max":"5000","multiline":true}	2	2019-10-17 14:40:14.526729+00	2019-10-18 09:35:47.303299+00
yeast_derived_lipid_amnt	BOOLEAN	Yeast-derived total lipid extract (P. pastoris)	3	{}	5	2019-10-16 11:04:58.041626+00	2019-10-18 09:21:13.026523+00
bio_deu_has_expressed	SELECTION_FROM_OPTIONS	Has expression & purification been done for the unlabeled protein? If "yes", please state typical yield.	3	{"variant":"radio","options":["yes","no"]}	23	2019-10-16 11:04:58.041626+00	2019-10-18 09:07:14.287757+00
ttl_biosafety	EMBELLISHMENT		3	{"html":"<h2>Safety</h2>","plain":"Safety"}	31	2019-10-16 11:04:58.041626+00	2019-10-18 09:23:10.430825+00
bio_deu_d_lvl_req_justification	TEXT_INPUT	Justify level of D incorporation:	3	{}	22	2019-10-16 11:04:58.041626+00	2019-10-18 08:52:27.411696+00
biosafety_has_risks	SELECTION_FROM_OPTIONS	Is your organism a live virus,3, toxin-producing, or pose ay risk to human health and/or the environment?	3	{"variant":"radio","options":["yes","no"],"required":true}	33	2019-10-16 11:04:58.041626+00	2019-10-18 09:23:29.327429+00
chem_deu_enabled	BOOLEAN	Is chemical deuteration applicable?	4	{}	1	2019-10-16 11:04:58.041626+00	2019-10-18 09:28:39.59244+00
biosafety_is_organism_active	TEXT_INPUT	If the sample is a a bacteria or virus, specificy whether it is inactive/active, if "yes" please explain.	3	{"variant":"radio","options":["yes","no"],"required":true}	34	2019-10-16 11:04:58.041626+00	2019-10-18 09:23:39.743527+00
biosafety_containment_level	SELECTION_FROM_OPTIONS	Which biosafety containment level is required to work with your sample?	3	{"variant":"radio","options":["L1","L2"],"required":true}	32	2019-10-16 11:04:58.041626+00	2019-10-18 09:23:20.099665+00
yeast_derived_d_lvl_req	SELECTION_FROM_OPTIONS	Level of deuteration required:	3	{"  ":"radio","options":["Full (~99% with labeled carbon source)", "Partial (65-80% with unlabeled carbon source)", "Partial (25-30% H/D exchange)"]}	29	2019-10-16 11:04:58.041626+00	2019-10-18 08:45:57.249691+00
biosafety_explanation	TEXT_INPUT	If you answered "yes" to any of the above, please explan:	8	{"variant":"radio", "options":["yes", "no"]}	3	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.351948+00
bio_deu_plasmid_provided	SELECTION_FROM_OPTIONS	Will you provide an expression plasmid?	8	{"variant":"radio", "options":["yes", "no"], "TEXT_INPUT":"If you choose no, we will design & order a plasmid commercially"}	6	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.373758+00
chem_deu_d_percentage	TEXT_INPUT	Indicate percentage and location of deuteration	4	{"variant":"radio","options":["yes","no"]}	5	2019-10-16 11:04:58.041626+00	2019-10-18 09:28:39.606506+00
yeast_derived_d_lvl_req_justification	TEXT_INPUT	Justify level of D incorporation:	3	{"min":2,"max":200}	30	2019-10-16 11:04:58.041626+00	2019-10-18 08:55:02.886022+00
biosafety_is_virulence	SELECTION_FROM_OPTIONS	Is the sample a virulence factor?	3	{"variant":"radio","options":["yes","no"],"required":true}	36	2019-10-16 11:04:58.041626+00	2019-10-18 09:23:58.839143+00
bio_deu_d_lvl_req	SELECTION_FROM_OPTIONS	Level of deuteration required:	3	{"variant":"radio","options":["Full (~99% with labeled carbon source)","Partial (65-80% with unlabeled carbon source)","Partial (25-30% H/D exchange)"]}	21	2019-10-16 11:04:58.041626+00	2019-10-18 08:52:14.640914+00
bio_deu_other	BOOLEAN	Other	8	{"variant":"slider"}	11	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.39184+00
bio_deu_other_desc	TEXT_INPUT	For requests that do not fit any of options above	8	{"min":10, "max":500, "multiline":true}	8	2019-10-16 11:04:58.041626+00	2019-10-18 09:35:47.381504+00
chem_deu_molecule_name	TEXT_INPUT	Molecule/s to be deuterated (name):	4	{"variant":"radio", "options":["yes", "no"]}	2	2019-10-16 11:04:58.041626+00	2019-10-18 09:28:39.595803+00
chem_deu_prep_source	SELECTION_FROM_OPTIONS	Has this molecule (or an unlabeled/isotopic analogue) been prepared by yourself or others?	4	{"variant":"radio", "options":["yes", "no"]}	8	2019-10-16 11:04:58.041626+00	2019-10-18 09:28:39.617553+00
chem_deu_protocol	FILE_UPLOAD	Please attach a reference or protocol for synthesis	4	{"file_type":[".pdf"]}	9	2019-10-16 11:04:58.041626+00	2019-10-18 09:30:53.584532+00
chem_deu_chem_structure	FILE_UPLOAD	Attach chemical structure (combine multiple structure drawings into a single PDF document)	4	{"file_type":[".pdf"]}	7	2019-10-16 11:04:58.041626+00	2019-10-18 09:29:11.443549+00
chem_deu_structure_justification	TEXT_INPUT	Justify level of D incorporation	4	{"variant":"radio","options":["yes","no"],"multiline":true}	6	2019-10-16 11:04:58.041626+00	2019-10-18 09:30:02.996734+00
chem_deu_amount_justification	TEXT_INPUT	Justify the amount requested	4	{"variant":"radio","options":["yes","no"],"multiline":true}	4	2019-10-16 11:04:58.041626+00	2019-10-18 09:29:28.254889+00
chem_deu_amount	TEXT_INPUT	Amount of material required (mass):	4	{"variant":"radio", "options":["yes", "no"]}	3	2019-10-16 11:04:58.041626+00	2019-10-18 09:28:39.59968+00
text_input_1571391315398	TEXT_INPUT	Abstract	6	{"min":"0","max":"750"}	1	2019-10-18 09:31:32.301844+00	2019-10-18 09:35:47.294975+00
text_input_1571323780736	TEXT_INPUT	Proposed Experiment	6	{"required":true,"placeholder":"This section is not meant to duplicate the practical information collected elsewhere in this proposal. Please provide any information that will make it easier to assess the feasibility and technical readiness of your project. ","min":"0","max":"1500"}	3	2019-10-17 14:45:58.969463+00	2019-10-18 09:35:47.34579+00
file_upload_1571391506321	FILE_UPLOAD	Upload your figures (max. 4 as a single page PDF, including legends)	6	{"file_type":[".pdf"],"max_files":"1"}	4	2019-10-18 09:34:43.220677+00	2019-10-18 09:35:47.353513+00
text_input_1571391448636	TEXT_INPUT	Figure legend(s) 	8	{"max":"1200"}	4	2019-10-18 09:33:45.537138+00	2019-10-18 09:35:47.358776+00
file_upload_1571323955969	FILE_UPLOAD	Additional material	6	{"file_type":[".pdf"],"small_label":"Please upload PDF files of any manuscripts or protocols that is useful for reviewing your proposals, or carrying out the required work. ","max_files":"5"}	6	2019-10-17 14:48:54.200169+00	2019-10-18 09:38:42.312718+00
rq_deuteration_level	SELECTION_FROM_OPTIONS	Level of deuteration required	3	{"variant":"dropdown","options":["Partial (65-80% with unlabeled carbon source)","Full (~99% with labeled carbon source)","H/D exchanged (25-30% labile H exchanged with D)"]}	10	2019-10-16 11:04:58.041626+00	2019-10-18 08:50:17.481535+00
text_input_1571388053776	TEXT_INPUT	Does the sample have a hazardous ligand (e.g. heavy metal, toxic molecule etc.)? If so, what is it?	3	{"min":"2","max":"200","placeholder":"e.g. cadmium, cyanide","required":true}	38	2019-10-18 08:37:10.775893+00	2019-10-18 09:24:25.469857+00
\.


--
-- Data for Name: proposal_topics; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_topics (topic_id, topic_title, is_enabled, sort_order) FROM stdin;
3	Biological deuteration	t	1
2	Crystallization	t	2
4	Chemical deuteration	t	3
8	Place to put discarded questions	t	5
1	General information	t	0
6	Proposal Text	t	4
\.


--
-- Data for Name: proposal_user; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposal_user (proposal_id, user_id) FROM stdin;
4	4
6	7
1	3
7	5
5	5
5	6
8	5
8	6
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.proposals (proposal_id, title, abstract, status, proposer_id, created_at, updated_at) FROM stdin;
9	\N	\N	0	5	2019-10-18 09:21:22.481765+00	2019-10-18 09:21:22.481765+00
4	My really excellent DEMAX proposal	I'm going to ask for a very difficult thing to be done, but tell you that it is really very scientifically important so that you let me get away with it, grant my proposal and then I win a Nobel prize!	0	5	2019-10-17 15:00:39.753058+00	2019-10-17 15:06:33.980305+00
6	gadgetgrgrts	greeterhtrshtrsegtrosghptrkhbptbhpf\nb	0	7	2019-10-18 08:10:02.711156+00	2019-10-18 08:14:02.082571+00
2	\N	\N	0	4	2019-10-16 12:55:01.131499+00	2019-10-16 12:55:01.131499+00
1	Structural bases of the reaction mechanism and inhibition of hydrolysis	Structural bases of the reaction mechanism and inhibition of hydrolysis abstract	0	1	2019-10-16 11:07:08.775593+00	2019-10-18 08:59:35.607642+00
7	balasdlfuhaslkdjfhasldkfha	a.ksjdhfas.dkjfhalskdjfhalskjdfhlasijhdf	0	5	2019-10-18 08:46:42.249906+00	2019-10-18 09:15:59.851969+00
8	crystallisation proposal	dfgdsfgsdfgsdfgsdfgdf	0	5	2019-10-18 09:18:47.587779+00	2019-10-18 09:40:17.702607+00
10	\N	\N	0	5	2019-10-18 09:58:48.886596+00	2019-10-18 09:58:48.886596+00
5	Perdeuteration of triose-phosphate isomerase using pyruvate-d3	We request 15 g of pyruvate-d3 as well as the heavy water used to produce it. Pyruvate-d3 will be used to feed bacterial strains adapted to growth on pyruvate as sole carbon source to recombinantly produce perdeuterated Triosephosphate isomerase (TIM). The produced protein will be used for crystallization and neutron data collection. TIM perdeuteration and crystallization has been optimised in our lab. Further structural work on TIM involves the production of structure-guided variants of TIM.	0	6	2019-10-18 07:55:22.311004+00	2019-10-18 09:19:01.65191+00
11	\N	\N	0	5	2019-10-18 09:59:57.699993+00	2019-10-18 09:59:57.699993+00
12	\N	\N	0	5	2019-10-18 10:00:45.783922+00	2019-10-18 10:00:45.783922+00
3	\N	\N	0	5	2019-10-17 14:35:17.977044+00	2019-10-17 14:35:17.977044+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.reviews (review_id, user_id, proposal_id, comment, grade, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_user; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.role_user (role_id, user_id) FROM stdin;
1	1
2	2
3	3
1	4
1	5
1	6
1	7
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.roles (role_id, short_code, title) FROM stdin;
1	user	User
2	user_officer	User Officer
3	reviewer	Reviewer
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: duouser
--

COPY public.users (user_id, user_title, middlename, firstname, lastname, username, password, preferredname, orcid, gender, nationality, birthdate, organisation, department, organisation_address, "position", email, email_verified, telephone, telephone_alt, created_at, updated_at) FROM stdin;
1	Mr.	Christian	Carl	Carlsson	testuser	$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm	\N	581459604	male	Norwegian	2000-04-02	Roberts, Reilly and Gutkowski	IT deparment	Estonia, New Gabriella, 4056 Cronin Motorway	Strategist	Javon4@hotmail.com	t	(288) 431-1443	(370) 386-8976	2019-10-16 11:04:58.041626+00	2019-10-16 11:04:58.041626+00
3	Mr.	Adam	Nils	Nilsson	testreviewer	$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm	Rhiannon	878321897	male	French	1981-08-05	Pfannerstill and Sons	IT department	Congo, Alleneville, 35823 Mueller Glens	Liaison	nils@ess.se	t	711-316-5728	1-359-864-3489 x7390	2019-10-16 11:04:58.041626+00	2019-10-16 11:04:58.041626+00
4	Mr.	Carl	Fredrik	Bolmsten	bolmsten	$2a$10$1svMW3/FwE5G1BpE7/CPW.5SwY9VZHOOw6LVX7INX8KkUIochQfWe	Fredrik	12313123-12311231	male	Swedish	1989-10-16	ESS	DMSC	Gyllenkroks alle 3	Section leader	bolmsten@gmail.com	t	0730699088	0730699088	2019-10-16 12:48:14.784203+00	2019-10-16 12:53:55.517993+00
5	Dr.	Mairadht Cecilia	Carina	Lobley	carinalobley	$2a$10$1svMW3/FwE5G1BpE7/CPW.NkwAaXNsSvB22v4PU3dBBs0EcPak5gu	Carina	0000-0003-3673-2767	female	British	1979-11-22	European Spallation Source ERIC	Science Coordination and User Office	PO Bbox 176, SE-22100, Lund, Sweden	Senior Officer	carina.lobley@esss.se	t	+46 (0)721792136		2019-10-17 14:34:51.22972+00	2019-10-17 15:12:17.785403+00
2	Mr.	Adam	Anders	Andersson	testofficer	$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm	Rhiannon	878321897	male	French	1981-08-05	Pfannerstill and Sons	IT department	Congo, Alleneville, 35823 Mueller Glens	Liaison	Aaron_Harris49@gmail.com	t	711-316-5728	1-359-864-3489 x7390	2019-10-16 11:04:58.041626+00	2019-10-17 15:20:43.313588+00
6	Dr.	Zoë	Suzanne	Fisher	zoe.fisher@esss.se	$2a$10$1svMW3/FwE5G1BpE7/CPW.arz.nauKliCeBnJc48nujUg8M/H1nHa	Zoë	0000-0001-8287-0269	female	American	1976-11-03	European Spallation Source ERIC	Scientific Activities Division	113 Odarslövsvägen	Group Leader	zoe.fisher@esss.se	t	0721792250	n/a	2019-10-18 07:54:53.193267+00	2019-10-18 07:55:02.82653+00
7	Dr.	Charles	Gareth	Murphy	garethcmurphy	$2a$10$1svMW3/FwE5G1BpE7/CPW.97REbPXKg7xfQHJ1T2Jhv/lRRYeR0SS	Gareth	0000-0002-2785-3674	male	Irish	1980-07-10	ESS	DMSC	Ole Maaloes Vej 3	Data Curation Scientist	gareth.murphy@esss.se	t	51328873		2019-10-18 08:09:41.00178+00	2019-10-18 08:09:54.036095+00
\.


--
-- Name: call_call_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.call_call_id_seq', 1, true);


--
-- Name: files_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.files_file_id_seq', 1, true);


--
-- Name: pagetext_pagetext_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.pagetext_pagetext_id_seq', 2, true);


--
-- Name: proposal_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.proposal_answers_answer_id_seq', 239, true);


--
-- Name: proposal_topics_sort_order_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.proposal_topics_sort_order_seq', 1, false);


--
-- Name: proposal_topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.proposal_topics_topic_id_seq', 8, true);


--
-- Name: proposals_proposal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.proposals_proposal_id_seq', 12, true);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 3, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: duouser
--

SELECT pg_catalog.setval('public.users_user_id_seq', 7, true);


--
-- Data for Name: BLOBS; Type: BLOBS; Schema: -; Owner: 
--

BEGIN;

SELECT pg_catalog.lo_open('18605', 131072);
SELECT pg_catalog.lowrite(0, '\x255044462d312e330a25c4e5f2e5eba7f3a0d0c4c60a342030206f626a0a3c3c202f4c656e677468203520302052202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ad58c96eeb3614ddeb2beed24651469cc9ed4bbb6881a07d8d811628ba50550556e12191dd3cf4ef7b486ab2e5e9a54e16b26cea5cf29e7327bdd1677a23a12827eb1569afa9a9e857dad0c3e38e53b9a39cf9f0670c71fcefcab0382c5b93e38e196345bc5d65fd6d4eab84b8a225bd0039fce3c1376059aba5cf4dfa1277ca4a6f480a47ca7a2ad7f469412e3d912ed9624d0f8b45b0bd78a1d9a7625797bb392dfea6ef17d8fbc3cf555356affb7f8a1535354c68ce72255cb2a02571a158ee1471af33c03ffcb0e6f4dd369e5a792ce5dcc5cd2847dc1ac685b5581bb782b5a25babf3009b8b6ead1082716302ae6f71fbb5c7b8c2782672ed6fc1955c32a1445c7b882be90b297aa2875faa55b1afdfabc7ed6adbd4eb6adfd465387b24ecf139b9969e1f27fefe36b83f399c63fbca2a43420ba68d72c15670fb1a5c8443aee21514ac70132fcbf6f7e7535ee73973dcd8b8247ccead111014ec790f6ab96526d7a23d904c4e3d7b90f33ae1b90d60d049069d481eedb597439dfcb4a96850c955c4b0332082e41c1c2fca11b6b1202f68241910ad109b6a57154db9a4a2a98a91a5ec9cc687bd074bc3de8571cc59a57b0b9dd4a9dc6ef645bdd9d1ae7aaf1a087c9e75b2bf7aa0369440f9f4449a73e60487c536b8ba33fd5915eb55bda946f175aba1e13cc648a6a0ac0ebc3fcee0a449d05e968f748e79e9d55de403b03bcb0788ad7c464e38299adf6956ce099c089a6de7501baeebee8bf64336abdb5ff6fbaafb0d1ffea0c58f29e55da6249def48628876a12592fc5136a5d7aab9394c06e424aaec204c84d3cc3b94905b03e56c31088172caa7ca218b68a4d1cec21d9465c08195f63ecac2d6ee9b98a48eb5e5eb1253b92cea665d6c8670bb2298dec8205f542b943b39f574b1f9eb76bd9c02b69a191f0a4ccaa6a8cfb1acffbfdd7ac13c3a880ef4842e6e75c1a9742973ce744868930af05e575faa66942d47892d8bddc895c42639ea62c847a12fb9541613daa5d222c15e2a62038da1a01f96c5c51265f1c62a720a11f122c5c81559a40f79ad4f63a88529c175690cd4c64407ddc4ebb90c980d18dda31fcc80924ff2b1f0864989d6eed82143912d562bda07f7f4bde515d1f4664e894623e5e6d60f06bb1a9bc2b3ba5df0bd998157a33df35c0de0bde2b72f5f77863cf66407fdc8209a76cb60b7e948ed2b12449f68eebf29e659faa65fdc33bd3c9240af917ee90825e266b36b721949eeb45cd26676f3ece6ca89ceef3882a40bedb14e552d1bcd21f4cded4239818b518209c3878a3cf8fac391340aa01ee3926b261eee68ea99ec9eee69ea717b06a1e39bfceb347123dbb88ce3669e66c4a38084d81e97d5badeed8351cc66b37fc7162609f6602ec3b8e731ed69e70439d9a6d5f3e39ec2b8970b4daeabfffd0477801a26435418ae3850c3ec119275bf7432ec49cf38e69f09eacde30e84db8d69302ba492984855ce2097d80ea4314d189468eb38321aa6edeee6dcc0762195a1cca7c90c59e03231cfaf55196809ac6c77e5f6f56ba8511828a1793471c431ff272ff6dc1c3b5c5ace84e778e7c0f3b6393beb7185d710a855c8813c3f66e7185719c5a4415a9ee07e841e89b9d659f43018799cb6b1ecdc971d0521d938f85c6667f6f4dbf9ba351294d678652341a0100e4d8d8dcabfef963566002ebb91e882a2664f186ee971bb5ed728f4a800dd703b0af2f84e273b6011418e9e89298fc689dbd8f48c5fea4cd66acbb4e478a112d766076b8fde1559b4bdda0a107a0217f53c4462701632824627a4748ea3267a00abd26b8dcfff0199e245ae0a656e6473747265616d0a656e646f626a0a352030206f626a0a313331300a656e646f626a0a322030206f626a0a3c3c202f54797065202f50616765202f506172656e74203320302052202f5265736f7572636573203620302052202f436f6e74656e7473203420302052202f4d65646961426f78205b30203020383432203539355d0a3e3e0a656e646f626a0a362030206f626a0a3c3c202f50726f63536574205b202f504446202f54657874202f496d61676542202f496d61676543202f496d61676549205d202f436f6c6f725370616365203c3c202f4373312037203020520a3e3e202f466f6e74203c3c202f54543220313520302052202f54543320313620302052202f545431203820302052203e3e202f584f626a656374203c3c202f496d34203137203020520a2f496d3220313120302052202f496d31203920302052202f496d3320313320302052203e3e203e3e0a656e646f626a0a31372030206f626a0a3c3c202f4c656e67746820313820302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f576964746820313334202f48656967687420313234202f496e746572706f6c6174650a74727565202f436f6c6f72537061636520313920302052202f496e74656e74202f5065726365707475616c202f534d61736b20323020302052202f42697473506572436f6d706f6e656e740a38202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed5d895f5349b6feabde9bf7bad5b6d5b6db19dbbd5d5a5b1bbba71ddbe7bce7b4ddb6c312087b08590810208080ecfbee8280ec242cb24358930081847d93557c5f528057309884dc9b10e3af7efe6e2eb7ea569dafbe3aa74e9daafbf6ade39f43020e093824e0908043020e093824e0908043020e093824e0908043020e093824e090809d4be0cd9bf59595d5d74b4b33af1726e6e7c66667917031b5b030fd7a61616969edcd1b3b17818d350f704ccdcc0e6ab56d832a695f6f85bc0b0917af948ad64195624c0b506cacca76589d95b53550607062a2433d0ce197b4b6e4c8a47195e561252f829e3d45c245545929ee64d5cb2abbe5780c0f230b32daa1386ca049906d9352915e27f5cacbb91b1f7b2b5ae214117a2d2cf84a68d0e56021122ebe178b70c72932eccee3183c86879105196da0fa765585d7cbcbc39393e005fabf737aca8590a02ffcbc0e787b7ceec522e980a73bd2bb9fde1e78008fe161644146644721762514ab3606f2cc6968f0cdcbfd255a724618f815d7efb0bf37647e6833e17adb4f3c80c7f030b22023b2a310ab36c24e5ebeb4baaa9d9d8552f0cecdb92a0e39cef1013520fcc31c9f8f263c8687910519bd72b2cb3a3b47a7a7165756ec4434566a06e028977705bf78ee2409836cbfd45303fdffa370e81ed03f8c2cc8783d3c34203ff759731340b15253f6fd6bc98c43ae1e96bc2cf99fb8477fe3718c6707152fc2946f027c7f9288839e16760c0ec27246e1fb5e408c3780cc382a3bdaff4c4af896c739caf1d10d5646b2833aa6e99972c4df1ba0fc961057dede86890c0a67bc41fbfe85b30b0b5d2a555245f98fe1a1878cd61d547650af0953ae8787c49797b72b95330e7bd8f40ea29e9cccafaff3caccb8a8b775cd61c70ea69c0f16baa4a5a64ba598399a5ea34f3d47cfe848f0b3273f47869f1470a9bd7d2fd727f8dc6be1626e61817c44fda9cbd7f4f6b7a8947fa6249ee0fa1d0df0dd0b0ad4bc47383ec7037cff484e6856294dafd1a79b835859b53dddb71f45621a8e692055aa7bb9465128f0d62309dc920effb0f13d8c5859252d2db72223e01bd19958548db0876b82c88f11e2cc3a99c33f6c3c2258f5809b3d5726fb29424c07227045c2d905a73d56528cafd5a7fc2416a1b0eaf1b8a2fc87b0603a462df887e1b4c74a8ac3276c6437c35220bcb558ec8077ddb2889059c965b1086e99aa9eeef1b93923abf4893e06c786deb781f55968dea0674f2e050b2c8b08f1745d0c1579e7e5143437a9898f6bf3bd9fa8d87769f6a66446a6a79e3637f9e6665f1009ccf365ed6e099c0f09fa332d25b9b6463531aeabcee67b77a9da27fe27d5f8784a4dd5c394a47322be99beac5dedb1d341fcbb8fe3a2ca5ef66bb59fb8a83fd8fc37ebeb2b6fde2c2caf4ccecf8f4c4d29c6c6b09001cfb96567eb54d690993b3b2bb3a8b5a57774042b5978352a806aa0321face42775137298595a514e4cd7f5f7173635c55554607509cb19969dad5311213377accb3f4c4a103f7f9adb508f57a302a8062ab35df8f63ea6511981ce892edaac549677f76437be8a282df1cec9be97180fd7137c1d746810820bb1b88efa799ee37331096567a6e3d5a8c04b79b76ca09f44b06cb006515f608d5df386ca08744e7451f7f4d47fc6c56089f04aa8e8bc888f411ea30aba311d1a6483295b6b8b5cbf93bc800b42fed550919324fc564cd4dd843812c1f28e356b3b58b39d45fbef373a1a9c4830fea1b2db86862b7a7a09233c32d3d145d151d15d61e522d1c70beaa845bd06ee587c21712ce4ed248285b006e40585fb359ab1d9197bf283a12d702255777727d554071414605c228c3817c43bc90f38cef5c35238892aa1911786ac2f3d5f74b8e8a359306121112c202c2a09f282c251c52f2a3a3bf6bb1f6c756d6d76711153b04eb51a912408320c297afe202599e8086b3182ca0e43d7400764213524bae6eea3282cd067d5c92ae55d1dc343eaa929340d0ddc5fa315ea2c1f19c1bcd8b7200fe185083244af3b2b12101d61354618620af5be9e35a486ba3816aedf2901f77248905384f87674a477766641d32b340d0db47d4488bed0cc4c778da811d2932cadf1cacbbe14164c7a1df33ac2100b4cbdbfc11a4fd601b6db7941206cb3a4eaaa7279279a89c6daa27ed9b4d889be78d1deea5f98ffebe3981b12f1f960c1f1407fe24d42bbf6ba564eedc94c5e13d6f8b00f7ab28e78799ce6f85e0b16de8e8d4633d1d80feb974d99588747eb6f97567491876d4383f9af1a020af3af8487ec775ebcc7a37788b87fc672f98bf383ff727978d0cbfd72a8889397935b2f6b560c6c8f96b42e226fdf92c8c3f0d2e27b09711743845fdb012f281c44ef82857c10c1de1e6e9fbbbb0294cfdd5d0eb059c77c3ccf72fdef44860b0af2b6474b5a0f118c542a9d27aa4354f4ecce1e220fdfeb931469d8c27d2042e00022d444f8728ccd720a15f9e764613f8b724c3bbfb8a8778f596da60f38922a2b9c9313af8785201094deb9b69590328408e1cb417717807299cf7d98f038b1bcac6f44bda2f75932af41083b9e36bdfa3331fe2cb0f0f5dcbfd6d4ee4c348408e10b61ca2196f39900bf07f171f975328002a6308f086107e0f84ec8031c87fd3c51f3fd6a4dedcabedd11d9648aeb512f8f8b021e400153307c318908b6f52166a05adee59a9264dfec2076fb219dddab53eb1f4d00054c714e8c47bcf7f8cc0c965c98c185ec078cad2843fcbfddb363cbcafa281c78e0a0bb2b86af6b429eb8b0a0a6a303a0308308c298b1e3125bfcb0a7cc5e7507d12cbb8f573b31223ae58437fbffa2248f4b4a141a0d3388604d078b08f05ac34d6aafbac33c44884e39cc667dcbf163a5a620ea8c6e44d6d7d7616c372806fe991067df5898aa41a87c21b8dc8996d4f7f56ecc4d680306e5c3d896f6f6fc1a1b6df7e395491a848a0819bb7e090fad9577d13d37d9400451eb31168e5adf7d46c0fc5f4dd520ef21e2e6fc1f0f7fff395454ddd9b1bcbc0ca1d145113806f4a3567d7fdfafb15158d3c12202f3b262e68dfb0511129581732dfe951087f5352ce830231f46df42f1f4527bbef1d7c406be1b1521eb96d33d6a11f6b50f0eb2d35311b180f5354665b5ebccda5235013bccd6200435324f744f4d6e552ae9d6ec0411855613575af2afb898338240fbb3b8f6325e112beba4bfcfbd475110110445970679bfdce9f9f996fefed8d292ebe21074271d288cf45e66deb2174488957585cf7df4a2082282a0de971c5dbfc8ae34a95cee9b93fd6344f885e0a0bf22e64a1ff346020676f9dfa63965b406215cf8cccd792b417760b0023b00073b25092e1426cf31203b3735d33375038ac45a996b46c60fe1e26f387ed4f3944874cdceff6d791683de62a406215c8089bb9588371e8315d80138462726d06f2128ba58f1a17249bc68e78826a3ae9e5b50f04762fcada8881f2342af8a459742841744fcb3c2c0d302eeb6748a1ff0571ee76baeff11cbed89b6c068f68e1d2ca29d0fb15947bdd927fc7c4e0772cef203b712ec99f33ceef9c080735cfff35cff8bbc80ab429e53b010961554397407062b26d9414586c454cf2e2e0d4e4e760e0f37f4f595b6b566c86a1f959506173de314e4ba6765b864a46e4bbf25c6ff142ebe20e401140b48d242fa0bec00793fd7c7ff6cd84bdeec73819c9b6121f7131ebba4a76e25b7b454766ab24f7a5a404e36c2eaa24a8ad36aaa8a9b9b60e8c2b2822a87ee609e1d545cc83599cba332031a0d662b55ddf2a2b6d6dc570d19f5b26d29beaa42f4a4f001961d8378b6a353a0f830c07ee6e1faf9666cc3b71cdffb7131c2c2fcf8ca0a6a1310d99827953eadaf2f6e6d4133d15834598f02c60cdae6e63b25feb13b642ebfb2ba3abfb484d593f1b9d9d199e9e1a9c9a1c9896d49393ed633a2cea9afbb1919663b3a45c7111c2aa85f93223ae25a103fadaab243a51ad06ab735413d31313239a9999e4633d15834190d6766def1311cccf93bb10a74e739d88867ec9d06d9582584f9047d0dd580b148d7f957edfcdca7adf31cfe1e156e0b9eb19df6154104fa1a0a02231228604ecfdb3f79b64ecdba111e6ae5516b073b884e27a3d677bc009c5c841d1676bbe77d33c66fe3d4acac8cef4284d6d5ec3bd9411021b3bf535cff3f1213b0e105bb90f64f7f37a5a6eb6f75d6f2da1bd8c9224b9f9a65b2156d801d0411f2ff715fefef8345feb9b9b0696dc19a3545d6c63e0b38b019b6b2a7f77e523c7dfb708d41c7103ba8881cf2703bc266dd8d92bc6c69b1d68ccf58c99afb1ce69298e027d64aaf4bac67f71ac10e828bb57c86e64ad79c7c98dac3dfe2929181c312ada5418c610741c45a7e7573246b7a1eb2f7aa5131e09f9f877d88d8f866ccd862e1678c660775ec226b4f6ec98975bd3db6b897ca742c480eb2f72ab7b1fe4e6c348e0e40fcbc85a56d4481c6b3838a08599ffdbb38245b26fdf05e2a736562dd7cd80c8eddc7f0cb617fa515e62066b183aa4dce72fdfc73b37088cae8f4b4752569a9b763873eb684630f3236bd32af41cc6307559b60ecba28e4f9e664750e0f594a26d62a871a456f8548893db0833a76112dff8b24bc04279ceff32ffe50a3e8998f26da0b3ba888104bf8b22030aab464ff7ef187f8e7956363a9d29a7fa726331d456f217650b5c9dffcbc1e243c4ea9aec26e9dfde87b276b584d8a01b78c54c0712cc097490d62297650b5c9610f378082dd3aaffafa98898bb3acae81c5abd46ab3eaa4587967d4eb6e5176ec1cbbae8b0499b535681a1a685989d15d1a4e33cbaeaf77cb483b23e032898865d9414584e8f7b38101acf434346d1f7d158b3a4337f5cb5366ce1cf5bc00163a388cde334895b6f1d7c427ec979bd33830b05f66f1efcdd04dfdf29411b3ef9da86df102fb378ddcc2693c04db9e243ee17f48c272f6cfc9f30ccdd019e405151458c2ffe9fc00876fe044141c5383b383e81efff75e3e3333742679414504dae4bfdd9d8ff8b22fe1e48dc27c1ce8b47789d15702d120757dbdacd4641a67e83bac29a273d17b7141951e1dd788204258d7676cb7035eeeb763a371ca962d9f474734484e43dd3fa225f4cdd0b7d8b1257032a7c6214bb8d8ba49df850e147797bfb83ec4295b38facc96cfa3a3518318d01a243af724c7f78a90ff7d90e04c60c0d77e3e878d3b9f612f90913e703ac0cf1387046e7d1180bed1c7dc92e9d3205bbcd8664d21581ad1b9f7626362cb2b12aa6b9cd3d2ae85860094bd48db98bc649c3ceae389efd0e1204a9c0e6aaecce8ca67610d426104b0d0c1616096719acbf9fd716ceccb97ad83c358c44f93ca58e9e9e7f881c648d502cfb05938890e1bc97158abadcd4d2cab41b631621b2fa892740a0b4dafa9ee55aba7e617a65fbf46086236beb5142ea63e43df354ea2c3f180d743823265b5b6b6c238313727ede90e2b7e8e0f1299bc4a683423886cc98881132c71aca86756468b4241fc7ec4b7d9a254e000582c306199896eeb8b6813db8c7e1c9a98c8924959e9a9178205e8e1269db2653c2308221b5a95e38b535ef35f350e4f4e10df38f1ff8f4c4d16b5366311164bb1745b5fa46fd85af4239143b75afdf1ef7beee002b0d0c1614047181a6d4834c2cdd0e0949aea9d96e7c6f8592783a3032170707a182ac752f789a72b202faf7368c816d64dc858d1d8dff7203961f748c50f7261171d6148622462c73539115b1e36666794dd7e1b7ece8101380311260a71192ac752f789a7eb5e4c747d4f8f2dac9b2cafae4ececd62c3916ef781270b1d9ef47c9dfcf5e9dd4f13b9b05362649420bb9fde9dbcb719e34db523c95a00dce6709ed3ae4df4fb4d6e88044f1b1bc6a6a7f155196a4d98bf9e5d7cdda51ec6d4f54658080ef1c6a9d11bdd1e5b96c8072cf4fe5833b8b01311a241c8eea7dd4fa7c4d88545252c2d6181896e6d42f69b5ce47124c54570d14f31b587dd10d6dad999d2ce0ede93c24b2201d9354624b9e1ffd1efecdb295b53ef107618bfae4ac6d2a6fe3e84239ee2f87ec966d1c714d24f4e717cdcd352f08d1babaf6429c7c713aaab7e4b4cf896c7213b2bb7a40d50a8186ddd37e382b4daf8d803626fc002cc6ba8f7484f0528f43185f49613be5ebf4488c5cf9fe23b50867a2f33f7f1a1f3c0c202ac157ee5efbd0d1133246f280bb1af6e040b635e961a1f9f43beb801930c86194e00402186cadffb7de2cff14c4feb181c6446f286de82afa83f484e3ceee7f3c5e65ed7bdb76e6709c4be72494aa89277191fc346be4a03930c86190e7d45213b4bb6d41de2f3bc1f1fd7ac54189215ddf73776dd7677df8e92d0374a9331612fa7f128b4dab8b2327823e122a6bb9e10456d77b775f664adbf25bb6e8b9b9a6e868ae81ba5890631ff349ef5b7330b8b6d436a3887e1b1a7bb9e100504c2e49e2c9c64babab2b2bcb4b4b4b8343d33ab1c19cdaea9f941c8c306701881961a01508ece2ad07f57e20b77d76fbc3c7e8b8e2c6d6cd468c7e6e6e69616174d4a73f3afc7a6e75eb675dc8f7984a250201d4cd9d873cde7a69695f5a8549398982c2e415010178446df7885f2e7a66726b463da518d626818d17db165a5f8ac80651121963396b311630019feaf245c5258d0d8de313a3ca21919d58c9a92f0fc88667444fbaa532e292c445128900ea61044cef9fbf0b3328bebebbbfb072022080ae282d0e84304a04f68c6869583830a554fff404377774279d9cf6121c73cddbff2661ff7f1b448facac7f398afe7511ff6514ff7eb4182e0dc9c62599dbca757ad1a1a54aa540aa54909599011d95148486eae9348f8b5978745ea492de49897c797eeae57f9dca0ecaca25a697b979cbc17a04068f42182e142a31e55f52b550338a24501508a1a1a3cd2d26e8689af898457843c0ba6ab22a15398d82335f599540679e27566c041b043466447212f6475fe19e9bf4686df080eb2605575450978182b7e8f89ceadac001cfd7dfd7835de0ba660f8a20f11c03dae1d1ba6f4d5c68e8ec4b2327e5e9e5f46ba574ab205130a44b14965e52d5d72f3d841a512e9b1edf2eeacaacad0c2024e668605abba5554e49327752dadefdeab5469345a685dfa10595b5d5d989f9f189f500f0d93f7f6f6f53777c9ebdadaa52dad354dcd164c2810c5028efefe01b3d9f14e38fa1e3bd03f00501ada3b2c5e5bd2f0c6b6f69edebe8d9762801d1ad68e8f2f2d2fd38708f1172d2c2c0014a26189fe9a1c1ba729112bc2346d6e58f5335a5b8d1670d06d09137fd1dada1a0edfde34417536de32fa015d4967696fbecb34bbf743b918ac2d46ab657c1386e9d31ae9e3a3a36487041c127048c0210187041c127048c0210187041c127048c02101c624f0fffc4944e90a656e6473747265616d0a656e646f626a0a31382030206f626a0a353239360a656e646f626a0a31312030206f626a0a3c3c202f4c656e67746820313220302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f576964746820313238202f48656967687420313234202f496e746572706f6c6174650a74727565202f436f6c6f72537061636520323220302052202f496e74656e74202f5065726365707475616c202f534d61736b20323320302052202f42697473506572436f6d706f6e656e740a38202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed5d895714471affc73687573cd7ac1b138d31abc62bea6ae2c664b32fd9bc1c26bbd978018adc28370a2a8a8a8a020203cc70cc7ddff70c30cc01c321eafeba6bc08681a107ba87119b574f7bbaabebf8d5575f7d5755bf7c29fc0908080808080808080808080808080808080808080808080808080808080808cc8bc08b172f9e3f7f3ef9fcf9c4249570813fdc9cf705e101a70800ed898989e8d8f850740c0917f8899b9c562214164300940d70c363cf5cc1a8c13facf40cf73ac212cb90c838d8a41f40c2057ee2261e2103b22133351ec28c580a11819dd01c054886c62674be709dcc95d56cf9f77dcbc95ba61335fabf57eb8ed20917f8899b78840cc886cc78052f2ea5fe37fddd172f9f4dbe088f3eb305463badc1ea5ef7cff7f5072a95ef1729d75c56acba287b37533a9df01337f10819900d99f10a5ec4eb28e44d4772b1fd077a1aef709dbcffa77b96fd15da9d5755407843be726d0e3504b3126ee21132201b32e315bc88d751c862eb7f73df9b7cfe6264fc1998f92d99ff9706eb8e6215a1f0b5b9ca0513991d78052fde94f9b5be116116244b4900df3a1069507abfbb6d04921b73298207852f083e95819e1d78052f7e5b67c21008b32019fc29e9de1b8a366a7d671f9b775d4982f299a333350bd4a71f58ef28fb9d43a3828ec0661468d56a5ced09feafd1fa49a97a737e3294cfe44ef42cd894a7dc59a2f9eda14de10c093a021bfc47279e7943e1076acfd1ebbad5d9f235390a2655277b8dd751c8916bba7b4aaf3b10191d17d6e20506c11f1e6dd679339a8cbb4b555ce1bfbb547de189a949eb45e10b54ffc63f360f8c1476d84ed4a8b7152e96f3c47121148502512c0a7fe3015e00009577e4a707d6bf16ab36e451924cb20c678efcd00bf2942810c5a2f005aa7f831f133b8fc41efef2962909699349edf35dd36b318a95d82313932f9e0b0af15c6446ec3c2dc6c0b1eb7af6dad61c041f370a44163d76ddd0620c064727310473d5ffa6df1b9d98f484a2f7d5fec355da5559943d870db66cf250f867c90e55eaee28071c4363d109c12e3707b145c6260cbe504d9feb60a576f5a5a54a9ecc71a1a4d04bf2cf2a74a562afdc150946692914934098078c7108462714cea152b1f3b30aedd225cfd9f867cbf7946bf3442eb13534383241552be0cf001f978191891e5bb0b0c3b53735f8cfac5df8d51f197f6a1ccc6ab17f5aa6e183fe512c0a4715a848403b1e017770f48edc7dbac1b0f30a079a6f3cff41b1281c55a0a2f8dadfcc3b44e68f4e4c624d9439c3b96d56ce345fa6144acbff440b4615a808d5a152c1474c647e67300ab1a456e63f75dbc8a5e63b730888168c2a5011aa43a56f9a8f188a27749fc8d8336f78d4361835f447e5eee156f350bdca5f2af1fcfac8b6ab4ccbe41b7c5c7f5ca63dfdd05a22f6d4abfa9f9a02ddf6a0da13b60c0ca34968d8cad68ed13ba89fc6fee1468db74cecb8d8eafce5a1ed1f378c87aa7410ce3f2ed16c2e50f18139b3cc4df9aa1dc5ea7d659acfabf5276a75a76eaa4f37688b451634090d5b79da318961f086c7cd83a33250bb2958d3e73bd368fafa96f6e035dd4757351b2ecba19c520a177b0f2393b124794d6c11a4c6b5d9d2f597bb3f2ceaf9a24679e6b1a946ea6b35873025d154347865788d490cc343ed6041a707d47ef286f1408576d755d507c58855506d2a50adcba12319e067e1c4dab9e070d06b314681f2ece428d6e5c836e6c9b6152a3e29511facd67f55673efdc88ea6a2c1afa3d7984466c2cd044f078ced2acff05353b0aac7f7c713fbf11bc6d4533b93f3cc7b4d8f08340ea48d79ca1d255a34150d46b3d17874011df191d521ed63ead040b859e1e983b3a95064fbf1bee578adf14095fe9352edb662f53250fb82d38164c010601ae628decb55a291682a1a8c66a3f1e8023a42af0e91749697c69e3df747c64cfe61a93d08672bfc7d44922774951ade3e2f85b31c85e96c8c19b1ad4071bc5af1c743ddf51e67bb6900918de8263a9b6efa1a5ad5acf717b6db7eb86b82bf1b2e57e83b10b9095da588b74f03b8f48ba919b1feb26c6b76f747b9927dc57ddfd6aaf25acde8263afb0affe5b3e39128355f784ceb8f3ed20d66349b5f639a8f1f324a3090adcaea79fb6cc75bff6b43da92d579ac427ae1b1e1a1daa7f546b0288c8c3d9b84376799ecd8244aedb1ceff4793e3d80de3a765af39cdcf1c021afcee772f74be734ef4f6d976a435e74518829df9dd87cb65bf3f34605140901e86e0d55c48d515e1f64a57e8aec273f6896577b99644fdbd667c7e26e0b3968f35d9d27733bade392f9a4e6f9f13bdf5473b122e7616766351b82b73295dc1d4af0884dbe7b65a4eddd04198df5c40072a40804f8d0c9f10b759302efa673cfed444a0132ed66775eec893fca35a91db629abd22f0390b08e5775902d92de6e3d754efe7c9b9f5952f1a2ece5f9c03ffb8b94056844b4dc62ecb606a6601a17c807fa44a0df0d7e7a4c86ec039bc0b1698187f3217c88af079a91443c0f72c20d20e783ed8cecaa67cd825b0f8aebed43b8bff4f2f04d317644520b3008c086b01641200c5070722d20e165cf0fc154ef994d8d94d817fa1631aeab92fe8e580cc02ac05588e2989889f285fb84d5b8d03175bacbb4bd42b95e713a6b400e761ac026450c82cd8992739fb48f744eb855ec007fd5b06478bbb3c5fde848b4abd92e4ccf8852059fcc95ab0f162e79eab3de79f18f4be08853f777a31b16ac21278faa10d364c58a8e2dbbc42eeb0e6fcf1ec68d505d1ba4cd1a95a659f7d28b6d786a3758058357bac435fdf34c25d028bfd0a413b4e8f88e9bc6c387f1c17c22c78e74cfb894ab9c43cc0ed5e1b1cb0803dfed8668e9dced8724b319fb896af8c3b49731ec628c040011bd1d15259bbde0fb8001a57ab00ceb8c0310bd8e98ffde602fef19c27b60ad3f87f5e2a6bd2fa011740e30c7ffa04003e22c3d368d62c81f333a5a023e5b2667d3fb79e1a1e7746a40d1f5b12e7275c88d605e0ac115b87f888ecd2f8a2ff7de240fc0c4238569efcb914ce4fe4cff7323b3f2ce8f9adc1a0f1d0f22757dc67aa1c7768bc5e3580e025c4cfac3cfd6b29f813fd6b7b4ef7cff70c77147e7790e11d9b426fe9ff9348126ce7c7a67e0c01b63613dfe2ebea619c667dc9727e6285a63d32c42fb32ea313e0ffb35673a3cfcb57d4cad4693038ce0243804dfdd8574e7cebafa5877d1a7cea6409d6d61e9acf136a271e49f22f45f9f50680afa58f5b899d78c39dfe4bcd9da9d2c82cc0890ad8d48f1d6dfb2be16ad76c2f52fea550b1b59072c4accf8382265f9b1ba7234c79b4d3cd473383f310da8626754ef4ee791154dad519afd2da0cd186ac8e4d599d3078fee552d78edcee3d457d874ba43fdfd1dd96f96653fe14624be73c4cfc493c218eb3c0890a4fb40315dd9ef34db67fd5698f5e537d56a9dd59a2da9adfbbfe720f3d048cddbb8c888e745bbb99f8c7689bf63052f6842cd1fa8b1dd3e9cfd99d1fe7777d76a5fb4879dfb73794e71a4de55dce469557660f3803517ee315678e26b1480c4646d5ee48936ea0aadb81b8fa8c16c77f1aaddfd7ebbea9d320ccfbabdb96e974b2ce8ca0b27d15ba2df94af02b2c196921f933393f4df91b323b7717f67e5e26871879b246f9f54dd53f6fbd4affbeadfefdbe36b3519ff7d4842ea3e3e83e40e0d6da9068be4c8d02b1c8c1d5101a7de60b8fdb035153ff08d46e8d6f44e10ecb5c4811a96b783a491c911653b0a8cb8b21481ffc999c9f503ec0cf6fb537eb0721c34b1d2199332477bd4af03d693d61832f62ea1f4697d171749ff2b790d32f010edf7f53f8275b0fac210323138dfac0d1eb066ef7962e721e31299facaab4f5e05089ec91a61f4d458393ebe3629149ae96c5e6a6f11f6fd40f1ea9d671bbb77a71f833299f69bda1f1f70f8c8cc7f04f6f54d98f06b69618fb233552cf810acd32e31f47f94cfc116488384f34150da67ab752f0874b0ed162671e1b112cb4bcfc279ef299f823ce135155682a4f3e44f614cb554eb252232e1aa1b9bcec6d6468526c781153da24c8c7f0a763db48244341abc5dc3fcc1502cb59ce8b97445245503ae2a24944f4f2ea5ff3e14f6c682492e1fb5b1a8533bc9cb87155f78b97d80b83ed18d81180a0f465963ce7e1fcf1b3e050a9eca1ca979a7836ae909eaf1c6c44c25e186cc7c08e80e5c57f3ececfc49fcc825d853d0832e73b9e6d3ec4b8ba4fbc3608c6285876cecf82f299a3b0f572d7df2ba5d86a81dd2e7c7852b842387139646fbbc83af4dd72737e5694cff0a4afc9e8d872b113bb5db0e1885b4f6262c4b87d8a43f8413fd57d9e0355cbc7f993a4fc982c44ebc27b8b7aab240e74011de11699d49486ef20e0287e9c06bf83ebf34cd8c899244fb294cfc4ff836cf18f77d4e8023a921ac4b8aa85444a4b1dc1738f8dfbcb157fcea77658a754ec24be067631cc4cce1fc39fd605366674ecbbd273ee915eea18e22faa992bcc99e59048e97ab9e7cb1aed961cd97b29dbdb4e7431e26bb824651bc3cce0fcb1b1a06dd1abcf8930045f54caeff019d5ccc48dab6b28ef080306f1efbaa24ca9a79e70fb6ce9ea8b7dab327ba8ad73f1d8b2be432cd27c4735738539b31cc89c0803de5b2add929fd2dd31d3dc1ea1fb34f80b45ef271e0b7a16cc8e6a66f633fdae8977b2cd143859abc6d12238dd82fd5ab9a49c8b9273d8cc0e12d57ca25adea8a1b65da7e1ce77261510ef7c558ff7609516a7bb6023cf9250656d5b9ba6fc8577ac24a6f9f8a77454f32705dd19e9ad11136d179f1cbaade8c7360144a7a448e6e18df299b210b18ba6b3464cb4dd2e5bf0173a3408318aa9113879a47c3217e85580d845d359234ea9b64bd33c2cc9486c7629b2e1f389f390d8fe74d68853a9ed4ed33c25e72c6eaf4a3c9f4f7887e09f9e1a3139d550ed89c0c8cca3b69b729a67ce08a20b108df842a341ed0ea7cf4989e454c33653f09b9b06feb4ddd4d33c137fe217201af1a9ebaa3663207d4e4a04e7d7fa862173ee2fe7f8dc7eb20f7d3e3ebf36b3636b4ed7fb39e2f7b23a20a5235c7306623cfc24b360ef95be4a890b5d4e13bba82b385a2773ff744fbfa358c96d6c43629a07f8c7ab655f5c936d2f1023501343c037fe64166ccf93fc7457832ea3e34cdd27f5d744e6c7f9b15c72fec47c3e6613e8fadbd5be7fd569f2db2c85ed961fef6a0e944b375fea027d0222be4761d3a5ce7d572907253abebcde3122f3b79b03dfdcd273c5f913d33ce10088d22c68b7a35e9d2f025b538765a84864ffb4a8979c8cc437feab2f883666769cbaae6c5b6eef1807516d0c6a9f8fcfc7f09ca107a9db4db11590acfef8f96dad1a5a2a1425be670191456747caa59efbbc7cb9f4a8b659d49e409e2794ffca0ee08d7d498a48bf3a6f04c6011c8e870c7ccf02827f3a44ca25fdad3af6d41e27bd10fc71f6dd9c9121e4542898c86028c32100bcae02314ab8d8891809ac3ee681658b944bf65b75eca97d0e1e4ef31f1c3c88b31fe3edc0e4543498886128c62118fcca4284136674204ce5877aadd2bd0c9172c4c32bb204bfb8659a61678ba370c2d517e0ed71d43e037fbabf38ef0e470ee2d4471cbc391faf257e1f1c0203a709dfab0091458f55cadb8c0857e7ebccabf97a4a3cbc7572cfe16b3aa69d794e0a275c3d016f9f8176dc5890f98ec306178c4c267e4f1c8204a721efab00eda3df7fb5ef66af93bf33afe6c33f303c26b1f417b45bf69429e16c5d4d9b2241e41c5b2369ca67ef0727540177399ce6b0d5e045fe6601a10a2c37979b8d9d26ffc0302f7baee7c3df138cde53b87e6bd0ee28a20ea963260e3d50a48fece340a6e25e86103482d011bcc8e32ca007f7835cf17775caeb3d0e4720a53142f8600abed901dd1fe697c4dc63294f09fedb73c4a7ef6aeae52e37bb38284f68f49ed2f3eb3ded87b9bc73a1cdd95d07ca7a2f361b0dfe7957a5f9687829f7a17ae3b32930bcc0f6b51484177897a6b183a5d2db52a77d200cf6c2a6cdf4773c3104de43e5328c20afb2e8bacc8e6db95d3007a9522505119b4fb76de8ab5a258f921e8d3c9179fed3a0533802c9eeb1859804610922130ae16f14487404a00020a9b105119b4f8ba1ff58859c3f4d87709e98cca3f660b989edb1653301e83c443787c88442785d050002a00020fc454a933d5c93939313e313e1e1a863305c2f731eb8d287d327a08c2fc043e2e44936f9579d17ad3b2f3a52d27b4362d5bb0602a1e1b1d151d6696c7c6c6c283c62700de0751482a250209b7a93cd436c1180028000168003880054b2d49298acc81eaee84834141872bafd52a3b3ac55bfa740c21ffeeb333b3ecae9faa156d62cb3389c1e8fdbebf3b24d7eaf6fd0dfdfefeb773abd781d85a02814982cb66cf213fc010500012c00071001a864b96562fc31a0232323438180dfed3599ed6295a9b849f5b77c3135afcf501f26e032d12be6b6cb9da7aa7a8a1eabfad416b7dde9b0d9ed561bcb84cc78c5e37021f569acc54fd45f57f76ecbe9221a2b974d45c7cfb4bff57bdba779e2e2272ac00270001180025c002d31aaec9f8e8f8f0f0e0cba9d2e97dd61325bfbb4a68a56f5be6209553bbe47407f9b83b37fe9b347f614898b1f2b3ae57abdd19214f8648cf08a934e4693ad5b652a6956ef456bc9d713b86dedef6d7ffa6fdb9e7c71798b0ab0001c4004a0001740638f70e29c60bc98fea46b66b3556d303774eb7eae931d2ee93954dc7db00849c2493a50283e58243e5cd2fd6b9daca9576736996d162b4bb24f90ad5566fcedb61cc5d2ade5a6a9e82f5a4b35b850fc634ddf7db116b0001cd20cc005d012a3cafe29137f9bc5865a943af353a9f181c4d020313588910c0d62fd12d3fd2edddd0ef5dd4e758358d72a35aaf514f836d66c2701fe5a830543f040a27fb0e4464ef791b4b65ea4bed7a169eed12bb414f800870ffc27c6c78706033e8fd7ebc652e86624fcf4d169d67d661eb6d76e97cb41ffe1825105dbd753fc4aacb57687cbee7463ad71c5da09880014e00268ec293c714e4afe191f8f46a39148241c0a3152381c9a4eccfb8bb90e854241fa0f178c2ad2f4fa556b8368f7ab4602220005b8005a6254937d4aa4502c2bc25f0204b8953c996344b4308c82f097180100c5c44db8161010101010101010101010101010101010587604fe0f80cf9e870a656e6473747265616d0a656e646f626a0a31322030206f626a0a353137340a656e646f626a0a392030206f626a0a3c3c202f4c656e67746820313020302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f576964746820313330202f48656967687420313338202f496e746572706f6c6174650a74727565202f436f6c6f72537061636520323520302052202f496e74656e74202f5065726365707475616c202f534d61736b20323620302052202f42697473506572436f6d706f6e656e740a38202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed5d895753d7baff83debbab7db6ab6510109947416671a28a565b6b6d156c559cabb5b6b67dd55aadd4e2bb7a5b6db5adf75aadf340c18a030408810ce7e464820492008104c4f7db67074c808400e784488f6b2f39c33e7bf87d7bf8a6fde5d933e99f8480848084808480848084808480848084808480848084808480848084808480848084808480848084808480e8080c3d1d7cdadf37d8d33d60b50e582c031ded24e1c26ac543bc4206d11bf1b7af00383bdb8d0e555b4ffd93eefb35f6bbb79170815b3cc42b64f8db83240a00432ed7a0b5cbc569fbe58d8efbd5f62b17bbce9d31577ddb71ecabf6af3e43c2056ef110af9001d990199fe043511a34eb0b1d7af60cc9fb1ff0ec7df2a8ebfc8f1d077619df7bd3b0ba58b73c975b96c32dc9d6162f40c2056ef110af9001d990199fe043ef92a4bbc010f0a6c25387a35fc775dfffd372aad2b8bd8c5b9ccd264730b1af30312f33b17334f35f1949b8e51fbe820cc886cce6aa13f63feff569d941476f60754bb9c647002468fff5bc76ff2e6ef5626d4e129b19cba646016736299c0139bc131e9257c890198bccda958b343bb718cefd0b8418bf74e9e944080cf5f783f9b157dfd1eedfa95c9aab498ec4142020a7454f9cf8f9a24e0c571464a8777e68bd7ddd25edda1301eef57e78450209baefde6a3ffa05bbaa589d16cd2447bac7792054e0e78b2629429532977923dff4e501db8d2b20845745d28d1f04869e0d3d7dfad4e5ea53c8cd955febde5dc566c733f1afb12991134f8151044a89241f2e98cfad5dd671f48b3e79238a45e17e2a975e8d2000ac9cd62efbdd9bc6f2755aba11800418dea3409ef0169fe0c394b96c7a8c71d35bf63b37502c0a1fa948baf083c060b7bd5721b7fc704ab72c076c0fd9732704dc4f067e8fe096e7759c3e696f920dd86c7eaa965e8d20e032eaad57fe6dfc78a7b62085f09f01eec8be08c1ef114c5126b37db3f1a71ffb38895f1a41dadf8553d5663e71847b67059b1d37c51d610c45340b93942585dc67fb1d2dcdfeea96de0d23d0dfd4d0be67abb62095cd984716f629ec0863a8c0a445abd3630c1facefab7f345c8ff4777c04a8be148a20682126c1978ec17cec3e42e4bbd83986b797f7d6dc91f4aee3a33ffc94ea4ba191833a6812325a005420b276cccbfad222fbe58b92de7518eff1ffc24000ed3454a3d0cb09c01d795287a7028a45e1a802158ddf02e9e9b367b0d4c04c001d3514a40270471e54a02b128a45e1a802154978fb42002633d86b602c80a61acad2e9f2a8de544081281685a30a54e4ab0dd273a2bebb7b1b561b980cc4a0028a45e1a802154968fb42c0653458fff8dd7470afb638532849c1cd2ff13a25148bc251052af2d506e9b993d3769effd1b0eb030c5aa124053715789d128a45e1a8021549685304a8ee74b0b767a0d3e2d4730e65abede655d3171f436a26229bc7aa2ed4358a45e1a80215a13a548aaad180bfb3ae95ea4e1d1a75f7835acbc50bdcd12f355b3732cb73a1b82052b3085420c5422bb23c1715a13a548aaad180bf8faed573e4bbf49c53d9ea785c67bf7515eb43c7f1c3ba3ddb946b4b14f9692a6a149882352110aaf185a30a5484ea5029aa4603d00c34064d42c366f7ecf01cf9d68b17cc47bf34edd86c58b7425792c72dc9620bd3343949ea05f3196a1410427734ce6ce20b4715a808d5a152548d06a019680c9a8486cdbed9313438f8b4b7d765ee20cb4efd23dbad6b74e41bf76ce3d696b079a96c4218ef383147608e28e079413d37d00c34064d42c3e8ec4053d160341b8d4717d09117773747fbfb598db5fa0e5755a9d9bb9d5b5f4a47beb6308d250e15f389218cf7a61098230a840a745ef0ee1ca419680cdc368667079a4a1a5c5589c6a30be8c88b4585a1818141bbdd69d03be44dddd577acbf9e331d39a4dcb84eb1284b9d143163233f10baf0bb069d1d682a1a8c66a3f1b6df7e763ca881d5c36532a26be860e85304ed74b4c83b2f5dd47eb247b37e15b7b29083209c9faace8a276bfe4c8dfc40a8e0313bc8de91158f66a3f186354b4ddbcbcdc70fdbae5e46d7d0c1d0a402b50b10b65fadeaadadee3c7b46bf6f47db929c968470f5bc3902eba803c153a03c4c528466de2bea8430756e2af3f60addc1bde6b3a77b6aabd14d7476e6ed14c35e43745450bb404f5dade5e471e3f672dd9aa56c518666419c1aee404911c2da6bc6e17c04c27c6cc94c4a942a31a23569ae3c3d569e9dd85290ae5cb5585f51866ea2b3336fa718a602f5a0eb9337d96f5cb19c38a27f6f0d9b9fc688caf38b86f9582a6852a35b53a29a93e7ca92e6362484d7cf7ba53121ac2d3785ddf0a6e9dbc35dd72f3be48d500c028460af51c3f8d37aa9079df9c4d770f8d1c1833a2f055e58c4522c90bd782c32c17ca24e8d922745ca12231a92221b122341085c37a546cbb3135a1665aadf5f63faf6081c086740430bdfb9212207c35ce564d43db7af777cfd393ce8e0bef5e2aeffbe28abc244000912220809301d90082d221ae6bf561ff552537a8cfa9d52c39143f083ed633583c1e56679074657afb2adf3f4f7c66d1bb937f2e1c448c63ff5970ee28ae10b3da19eab52a39a29f294049e84880f23f32273be62599e6aeb46c3992a102298eb12660121c1c50bfacdebd9dc64624c9c9a1f6908d30b9e3348cad4a8a6647e0a785261e49adf291a12c264b9296d1fbe6fbefcef60ce082c449805840485e984049802b36217f09c4120812a355a9112d5e8870afc4ed180252b35baa9381b8408ce8ca0e7cb7aaaef182bca66eb2ca0b4e0b9a3e8e6e428c21df94f74a7488dc68c506ddb64abbe23f6793a7abecc72ea846e55f16c9d05940a6a3042819080120884209b78986265517bd509b1cfd3518ba47e47399b9f3afbf6028a7f403bc2d8d9c1ef11cd3949ccb632cbcf3f38c5f449c6410cc3c7bb34c5d90c51870ae341eab91a87c275403bc2582af07b842c35465e98a1fd68bba3592606bf446584de470f74efaf85500fd13e141013a30d93d811c6d282172594ef94daefff29bc2d7be8199511baef57ebdf2e81828b68874298cf9c4edb26b7238c22447c18a4b9d655c59dd7af086fcb0615069f3a9d4e5bcd5dfddaa5027b9086183589a4e6873b1d05bbf76d7ddceb4f22fe5bb1a2c07cf5523f94ae4ea7b0eb12e602a142ed3dfddbcb85f5209dceb815e35b01a850bac8823374bdbd4f85b693d215c95e57cb6d5c4bdc24a0af08b1313cfdf6605fc6720425aa3f79d97bf07b8912fc065d3fffb5b6f5a55d7fd5b85c2e8026ec5ca0bb738fac9ed9bd056e24f061987eaf43ad049000c2324830b1a436961654764b8996e524ab767ed02d7b0212003461a9404b736854baaa13aa8d6fc114389b74775394114668c1cf02285a1bb31315efaf0544004a0cfc69992e6b97ade171bbfb7c41c0f110427eed9aa28c40a940670174dd735f922fced27f7f1c100128f1a8403dbbba6befb5efddcac1cfb020ddd3a64f751ae3fe0f970635025984ea6e325a4600b05e29a2213ebc213e6c748a0b6b887b9d981bd2e635e624cb9764337bb6586bee0acfa37a5274383682d3682084f8bf4ad5071b3cfd5b4682e48cba50c5ce6989f99f96d857418850db0b687bbc64043ab613c2615973a7b8d7eb63e6d447bd3c3acd7da93ef21ff5a04e41a6a2fc5dfda9132041bfd120bcbce64d051a3f8ace089bac5e77e614f3d10eeebd357a848d5a59c09590c8515ab83b16653070bace4f66f3929034b9498a85898aec044d7602bb208e4d17c713784aebdee81d012480b0901a23cb4a682ac8682e5e4852d182e6fcb4a6dc14a4e6bcd496a2cc96e22cc592858ae57950dfb56d58addabb1d500010716781272d10ca8bb2ad36ab83d1f43436d81fd4da6efed175e147cbe9efcc278f998e7ea9fb743fb76f877ef716c3cecd48fa9d9bb91d9bb5e5ebb5ab16b38599841053424c8cafbc76043a0b4082fcb4e6d54b95159b3507f692f4f11ef5feddea7dbb909883fbf447be30567e83a5a0e3fc0f961b57c094763736000a97cd2aee2cf0a682e71d2548bfcddac7a87b9b1a7a1e3fb4d5545bae5f355fba68f9ed7ce72fe74692e5ccf7edff7b10e7beb982b450e0afe82c8029a73565d88ec06b811a1726b596bdc37c75c870ee878edf2f8d4ae81a3a886ea2b3e8323a2e865ce0897020d7548ec018c0598c419b75a0abcb65363b4d267848e28c8653a77d9e18559f4266bb705abfb22014fc04e82c784e02303cbc16a805c1f7ce9db135373958a6df601895d0357410dd4467e9f113b75c208a64100805269767687060c061efb977cdb066712868a246f345a00276e1c87fb442ff70eb9a13a15903f747f5f60e9a1c2ec1c93ddc42de7fcf60bbfcab7ef5a250d04479f14594f38f0b03cfdfbaa2d07ce9d77e93010d0e0e42c1a865980a03083cf5e461c7f7c7b937f266d64e87b5687c7d517c3838d296a5398693c7d054343818f804b70e0472349efd175351c62cca9c593b9d4f7d116cc771af37e5a52ab76e42536759e449cad94213c81ddcab5c5ea059982806cf194899fc2c886a4d993bbed694e7546519f39b97e6319fec251ab9591467cf2de5ddbeaedbb05a032fee99d363c0ef549114d994182183df29dd0b46fd0f42901401ed74e7ed6bc194c2c45e9920ce40ae849803d5d34cf1a8543a5042713dcaef741415704bf9d5250b0dfffc6e36c5d9835c09011f4a2768ff664a5ea3d201f1b503ce18ed63c11f79c2cb6e6477a8281f1d676f98d3107bdc0a5b3e3de3d3fdb84eb3a782e8fdb2e20359bd85cd436781978c3c02f8b8179ebbc3813d38e9f9fcccce8b49057ac6c776f512b76e05395a38133b029d');
SELECT pg_catalog.lowrite(0, '\x055e32f2b8e07b3e1cd91dd6ade8bc7a69e6cfec4c6f6ee0f017396675e2080e98047f4798f42cf02404d91d5e6e295e80333be8023a323d2466f26b9cc2c311301cb322677c827eba612ab3608410980ef161f28549ec8635e8023a42707cd156242fefeefc3472cc2a88da6ce00fa6141c11b6e380fcae47c0f7be684a8b6dcb4dd56fdb0437f5c1aeae21a76bec2f74cce4289fa86e2fefeea07bb48ec805e088a6e250314c0b5962646342b872655107f5c4ee7a61741a54d78da8059de7ce182a3669f35382a935e267014c067327960b86a1f6cbb592739dcd0b13992defe3a4739f46031f4591fc5b261ad7937b4fed3e3d4f1e9a766d0609d88c98606a8d3c7444bc141c08d47ef210ae355c961c45085151667df0c0e570821093436426720ff4f6f6301af32fe7b8d222612310fada59282f047bc1f89a523f2007f88aea5adf28349e3bdbdda61ee8ee99095c2757277e49c7f4cbcfccce0f3579c941a30215ca70fa668a9e75fec94175adf9e9ca1d5b8ce77feae3b8c92112dcdc5452eea97fcc7db217bfa4437ec645e4b39f7417c049cc69f242feb60610c88f341d5c8403a9cd2d295ffb5d87e042f00183f791c8dcd1c82e809398d3e18526a002250411a823da425e9a0e8ea42cfa2ee06b75e275adf24599fa6f0fdbea6a5da12a4d0747520615c4dd057c5181fac964272836bca93b79dc41a5e940d68860e5a1f1f110500bd19c48343c9c3d145452f61cff5ebb0090a1eea3b8c08ae10b40419ef3bb4303f58daf28b33fa809b5787a343e1e229b21ac1689048830744253c173fcbb77017e70e21c1912bcd6bd62860802fbd8420821c2714ea475f562cb6f3f855a3cbd01737bf7bd5b1d873fd5213e76e0bf30e897523ec73fc0011a18939971b0c5b42c5988840bdce2a1e83382ee0e85e9baaf0e5aefdd729943286aba53adb4541ed5233e4f6eb250bad351ebff732e885f198079734921cc61b04b22e102b78410622f4dfc046ccc8a57bc53aaab3cea502b83b5eafbabc7fd4b3a0fff4254d8e9ec0823231f22309582bdd67fcfc5815f16e047addab515bf940ad330122e708b87c4d71d193cf30b7bcd8f01f7eeb0bddcfef0afe796387f3889fb8eca08f63ffe6378ab643a3b021df9ca946824d8c5a814fc7cfc7b22c95341b16699f1d79fbbd52ab84920e102b778283a15d012be01647758bbacf38fff848225ceed7177f218b714bfe112e8192b5f23bf25390ac9a74500dd8f0f6b4c9fd7b22487fd6437fc3aa8bfb4db915f568f8778850c847142664fda097b4dfd348ab30cdf7d130a5e7c6e8fbb6d654c5146e03b82af910f73803f8b006f8594e7a7ea3efba8ebc615726a863f47e9d6a51b0d788857c80063252184b0c87b96c6ef0e385432e35e7cb4efbdf226eed37dbe3ceec68cf92844a2c3b16ebae64f30f23d7b8d6b8c6d9222dade2ab15c3c3f964ba4dc325e2103899343f38f2a44a85b149e1021cb886b5e96cf7cbaaf47dee4f69f1777f91fa774ba0e74d7ddd76f7acb97c79df79827f118110c1091e8a0f9c49a3fc1c8f744ccdd6bde77f1c0eeee470f88c43430e8697fa492235e310776c3c5118e8ee2f24b68120c79c951ca4d6f5bebeecfd4599241a7b3afd362bd7659bf6a1113fdb226319ce76ddca31d037ecc989f4b42624e8d93a4bae58274d5ae2d509b43794e86c578b678aa5747b6a682747200131f7a5253d86b7e8544ec11f3b5cb8002808c3358457e3460b7f7c89b2d67aab8923c8471263178539e8f7604f4401a33e6a76affe2ed2c8a1545c60be760428221c957e7a88d09d990196ef0e484acb0c87b96c65341b134c774ba0a5000105fad12efb9abddd475f3bafef3039ae2056df35f5560a9817a79caa3ddb3779ed7642d0a978177cd4b65767d687bf2c8ffdc77f34b4f1e21333ec18722f2aefcd840582aeed0c78002808887b6af92fb188de17495b2fc5d398ea0c6bfde9818c96bf8a73ada3d91f7bce623a1014f76cf36fc8c4ebf4eeb7f1f74f34b3a2d32e3137c08f33d21846799425dd3753227a5adfc5d4001407c6125de73fc1c39fbf981e692225966fc1457fb09d1c04420932bac75d5e28eb3a7038fba4f7f7d009fe0437cee669926ac6eb21928cfc0eb52d8430700887868fb2a19a742d415e5b2acc4869418514424be8f08554a22645694d96aab816d80bf40417f89039fe0437c8e42441c27bc5e51bd75634fc3135f5889f19c9ecdb1fff5a7f2ddd5224aa9fc7cc7e9e3294759a1116cf03942b5b855df931ded81e4e72538b162e5f9a61f3d9bd379e30a983411a5d4e1b37efaaa6fa716658546b0419016846a21360891a4695e9b2156ac3c6f2a60fc0fb85ccefefefebefe5ec4e7d1a80d17ceca97e5204c1cf45ac3822dbf3593c57c7a09a38b2016d9b8205eb9797dfbcd6b7693d1d16defefeb9b54c227f8b0fde6d5b6b2758d10e2708a0a8c2ba6d8349be7fd39ba0f10000500012c0007100128c005d0bc519cee1dcaecb6da2ced1ded469341a5d23eb8affcee586351c69388ffaa8f7d95302102263eae3e706bdbb88ef9eeb8ee619dd16030198c26e32493c1880ff13953790c4581a6448220b174846c2dba0f10000500012c0007100128c005d0a68bbbf7f7202e4ad6b39c966135f216654d4d4b556563693189a0921edb00f38a7009ca87a6f4798ad262cd3787b537ae6b5b5a584ec7322cab41dd9349f884d3e17314c21c3bac78732902f5134b90b009dd8736a6b4585155a9acad0138800840012e80e68de274ef30cb4062940f1c18a54add2457fe7ea9058695d2258d2b8a65258b044ccdab97a9f0cb3287f669af5f252450aba742024a2f3458ad2684b87e95fd7c3f8a45e102361545a1fb0041b16babeacaef2001c00144000a7001b4e9e2eefd3d360493a9dd8d869a61541af5fdbf94ff3cd5fac5c19683fbe5073e1230b57e7e903d715477f182b65136c559e03965e88c6894a140148bc2056c2a8a42f70182eaf4294ddd83e7539561011740f34671ba77fd4e67bbd9fc1c131042d1ca3c7eacb95faba9ad51d7fc29604299da8775208116e38a9f7dcf7be7096fe0d70c8ba248810feb50b8804d4551e83eca04146c6babbb9d3cdd0117409b2eeededfbb5c035d363b4a0689ddbba4a91db7ed964eb192675d93dd97c7e60f666bf9ba001740f34671ba77306aa14c1017b3cccd2ee202b7a2a691ba26c9a38ec3d006b3b57c5d800ba04d1777e97b0901090109010901090109010901090109010901090109010901090109010901090109010901090109010901090109010901090109811046e0ff019e7746bb0a656e6473747265616d0a656e646f626a0a31302030206f626a0a353837300a656e646f626a0a31332030206f626a0a3c3c202f4c656e67746820313420302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f5769647468203830202f486569676874203830202f496e746572706f6c6174650a74727565202f436f6c6f725370616365203720302052202f496e74656e74202f5065726365707475616c202f534d61736b20323820302052202f42697473506572436f6d706f6e656e740a38202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed9af993e47579c72d2c1185825d3447b90211d454ca83008250de0ab820544c40103c2149851ba2880182988820012cd4d568198ca556a534caeecececcceec1c7dcdf4f474f74c1fd3c7f4357dcdf4dc40fc0bf27a3f9f6ff7f4acfb83b3bbac2435534f7575f77cfbdb9ff7e7fd3cefe7f8f4ab5eb5fdb7bd03db3bb0bd03db3bb0bd03db3bf0ff6d07ce39e79c8f7f7cf73df7dcf7ddef7dbfa7a73f1a4b546af3cbab2f6273b5795ef61ce8e75f5cc0655cfc7f11ff6b5ef39a4b2fbdf4fefb1fd8dfd307ae95f5ff595a796961e985666bbdb1b05a9b5fad35576a4d3d692cacf126ff5a5a7d6965fdb75cdcd3d377ff571ee0e3dce4958f7dd7ae5db7defa77bffecdded5f5df2e2ebf08167055eacbe5ea52696eb1586915640bb365194f78599c6b95aa8be5da52a5b15c9f5f9d6fad2faebcb4b6fe5b6ec2adb8e12b13f559679d75d7ddf7f88361986ab4d6ab8d955275a950599c2db7f2a5854d565ec89b097549c0ed658b2b05bfb2c8e6f071f68a5b0542e1bbefbe979bbf72509f72ca2937dffcd98383c3105a5f5883a9d94a0b08b992cc21cd95e6b1bc67ddf0dd9bde0e08381f611fe65ac5ea228c375a6ba01e181ce12bf8a23f38ea77bffbfc67bff3bdc59517714578716c668b42e719cf3b2f8bf3fcabdb36fee5219dcf95e78dee851ca82b2da200d4cdc5f5e5b597bef3ddeff3757f40c87f73ddf523be208e47841aa1c20284cea307add0cc9a658acd4c61b3159bd95233cb63b1c9fe649d03c8c3e52179457a6bb6b24880579b2bade517477da1ebaefbd48987fcfad7bffe8e3bef9e6fadb10c82148c99c27c1663e540d34b3d31748d199ecc3667648d997c438fdd5668d8c5c6bb4196e70bb20b6df0ca8a105d5f82e8d6ca0b77de750f0b3861a8cf3863c7035f7d687e71bd5c5bce1717846b56d0da000d5d01504dd0a501986ba46765c04c17b0bab319aeb13d992936b1ce4de41e16fe1234c042f1dc2256985b2cd5d0f0b5c5d597befae0c32ce304403efdf4331e7ce811f226f2cbc200e5d6290605dc4019cc54ae0ed8f46c1d13a1052e687081aeb7fdf1b648ce8c6f34e5ed58c97cc3853c5e6d390bd4785161aee52093b8d1c687fff96ba79f71c6cb0af975af7bdd7d5ffa0ad28477b16671e779a6e7ab02986fa4f2f59421753085d1f37645a8ac2c6b6b5a5bc93d5a5b4896bb2c5734dd7659dbf845b40bd5c5626da936bfd65a7ee94bf73fc0925e3ec89fffe22dec2d5bbd01d6209bbbc263375217bced955b3c2a2491206c0e1755545af9016b7a9e372323c369cef48a471c1bed925793a1a858aa4bc5b925209704791505fbe22db7be4c783ffab1cbcbb54556086bce5767e4abf2d81406a7393dcac3e59c42ea920b00554ac91be5905ab656ee19dadb795ea80a94425500176d079c5603d998f52e5e0278b9be5c5f586fb6d62ebffccae30ef9dc73cffbcdde5e073669b8d279032bd7b53805a9945691e8909ada38981d8c5a279ad365bc5ca24471c673ac582301e94a782ccc51bdf028975008f3be2eb0cbaa4b95fa4abdb5bebf77f0dcf3ce3b8e904f3ef9e47f7ae8115800512a5f733c0aaf8254018bea0aac290f4594dc0f5f751e38b781113d97514ecb5658ad678d8d77daffe54a074ad10a6aa8f77c03c875202f636cce5c73a5b9f8c2c38f3cca228f17643c993ba3a2a95c2d9595df9a1b375206d6686d48632d481592aa06310f69374c2a13cf1acb144ed85c63c5b3e60ad9dc3dafd457f99787dd03be6c8ceb9e0ea99ca1ba5caa2fd7165617965fbcfc8ae3e3d53b77ee7cee273fa7ac85443c3989033b4e3b60ad3452f947cb43e85988e190386d9b2c78349847c20841c0345badcecb10a26a7375ae21ab3456ca98b984d0d91ecaa5eb2ba51a26bce5c63272fde3e77eb66bd79b8f9de2ab3e712db1e3c0c26f9ae005296503ba946f10ad4a2b26a14e8584b48e01d0b9abc7a3d8dc70e036a72277750e744d0f29606b0b6bacbf8a353150af08757db9d4c0870d635b01f01c07395b6c04c3894fdff4b963c47bfae9a7fff417bf344f16b3189eac9a90e241e501dd8d3a1a7c581a5ba38d75eeaa159ac95df504a47ad2c1be5269ca20d7f815a102382fa4c2eb8c771c76db10ee20d46d5ad952915b5fc1bd870231df58fc273ffdaf37bde998fae5f77fe043280f119accd5706681a5ccb02210b04a374a344a28d0ca620cd1067786512fdb4885dadb0117b60644e46ef0ebc0aed716d6493718d88d6b7c401fc77b4b3833486bc05fe1311ccbf40d860ff9a2a189d435d77ef2a8293ee9a493fef51b4f925c289604d6d4d8e930e45a3daf2c29b02494fa12403ceb529e0e3a875d8fceab372e366736bce277618d26da21f51e199208b23900d31282babe0a4c07399e2e1d1c9ee81f9e18189df48713dffcd6b78f7a10b4ebcd6751db64c841b986f364d7c828c9bab247a31852a7b28c88eb521e1792725791bb61884ff74b73e90e5e736607b9b54662c51aad17309e40b705b52ee60ee5fa2a78d385da903f7ac83739381a19f44d8e86a6c62767def18e771d1dc5575cb9dbc86d5a35650d1d8d1ec610461956991169427b0125813575d5a3f9a7c0b2365b9e87b14baf78c729f0865e399756e4ca8d190a9909ef6190dd3d71b091d0d4702036e48f0ff96383bee850301e98485c77fda78f0eefd7bff12484ca999129ab9d32747fc5859c9513b8312581128d09ac74d54b2526aa1e644f5ddb7ab5995cc7b5275cdd7ae545ee26bc8ba21b57e75be6e657d9f0e0446a34348d0975706a28101f0a4c05c2c9c71e7fe628f09e76da69894c85a463e5a269947a348d59f2659579c4ac6316123d51f504b6c3af298c8bb88e1bb783b7edd596675d3e12bf1d8936c850bcb84ef9e4acbea840c6c88f63d119f0fac209ffb8cc372ed423c1699fbdfce33ff9d3ad423efbec73680454609073d5d0917d16b2a5052257822c815ab6e8b315da32845a0b66d950e0b1ec6a06a1434ba5ae32694e976d7669a7cf6b9e3f2f0a7263f1050cbc509caf3427a7f2e158763c3a138acc042652fe3096f48d2546a07b6c3a184e9e7ffe055bc57be965ef9ba154ce9273a92e6c7c61f346eb53ac9c7031dbdcc8982e7718e42eb0e6aec6660763b757b7df8462db287ddced9ee99524ab8db7d65aa7238b270bb1c4ece4f4ecc4540ed4a1c94c6872261849fbc753a36389d1f169ff78f2cadd9fd82ade4fdd7833b4d21d5050895f79728bc895275755284aa3b44229673b7d18351b144bac24d41b541ad26ed5f24a0ebbcc201b6a0fb202b68d977c97cace4dcf94a7678a53a9623c55984ccc46e2b9f158061b8b668213691f2c871264a55bfef6b6ade27de0c1af21cb3833bd2d0dafaa0b75e286970424724da036c0b236cf15db14af1d0e16976e7bb58b5ff36d576bb537477bb88962763553ac27b3e554ae92ccce25b39504a8d3a558aa08e430900d352cfb89e8f124fc3efce8635bc5fb831fffcc6aaa9ab5f0f0ab2239afea42251c400cef1a3ee6b1e09ea81c7289b2cba5e15789c9736317c2dd8ffa97652eed8f79b57369aa32069e896c1998a95c359dafcdcce26f44d95c3253999a29033922c7269c73a1682680578793f0fbfd1ffd6cab787b07fd894c35a1eea0eee6158e5f39b34a0b89923cd992a3a54803de8dd7128720c804b61b63f77371dd813caf72821e2481f7a64be408c00213cb16eb5846fe564be7ab89ac204793387661229e1f8be6829114e422d1bfda3bb055bc91a9fc74662e916df36bc334aa47fa11a45560e7adea3b02de8d28862c479c23b71b63f773007267c605408ba78ad1c42c8f029bad402be832857ab6d4c831992f3573459ab23a5a9acc55a7662a500ce4c8d4ec782c1b50082790e88191c9ade2252ea6d2e5e96c35891715cd9fe98394768f8457f9c2ab88541258850fd8c3f0d21ad35fcc307f9ead430d26cd99ce4dc47388ede4741ea658fc54aa842ec12f243a5a7394ebde105ee74dbca4cac5bd6124962a45cdabc18b4a2359a3a13815f556f1eeed1b89cfe04e55a298eecfce3ba457f8b3f8b51a4391db2e06c0eb02998816de058915c5493227cad83df4041575c6dac271193023d3796210a4b164319ed6262432737c2a2d1fc68145eb6c851911bb2db3f3441d643050d2cdd3b834519c1f8fe1cf33d41ed45abff8d581ade27de6bb3fa4f548cce0d20805e31af5f5e0a5d9c44529ead4c508af570c74f08294e5253265580b47b3b2587622e648cc1a957914867821870a66aa08472c7b3a835580e0a40906f5a565875403a29266441ae172ff7c897a1ebcd5cd78c9c2e08d3ff5ec0fb78af7f6bbfe11bc0408bb2dc95203a8af963f7b628538af75e3258f4007c54004d68c3821c24b850bbf153adcd5004225c6fd31c1e45b7060d66f22dca195b1e4828dc2d00d99a60a1a563364d069452a4b0897a329e2177ecd9fc71243c1a9fbbefcd056f1eebefada68ba183385d486b3db68054ec5b8a6b16ce2ac3885622a3d9e644bf5587216a989c9330b54412a849270e7e8235d8a4496e70082517ae86066ab9a042add90e871604d1266cbf3edb99ff5d736b5d3fc4a8359e6f0d4b78d64b646d045d167f046a92dd3b40f340ed7dff8d9ade2fd8b77bc733259400aa63296fe8c6296a1d93ec51559d27409bcc414d58eb3a9345223d313b928a088471e2b882de84cf3a919240b2a66285935a2b7d935e35cb6b46c93043b83e84c1228e754a868a6c17c72d1f8e5e88a2264032f1d4420ac8ee9903f76d9fb3eb855bc6f78e31fe17bb88aa956452a0dc52c06c972f59572cd7232538e25f22812008959ca00973109439cd305234ff010c720eeaa86cb0e26342ae19ef21ccc8e93ecb05b47273633b15c803c62ae56d16081f3084e2b1031048d0d2428702ac40a3da4b8a2453ae48f9ef7d6b76f152fe3ebd0643a966a43263b40b1f61f8a97c89e7c23413a399dc36f2154f59eaa209208fd94ca03b1c6a3651f070d0f746600eda4dba5541b5c5bb1dad2098266b96e1aa69949b719bf8a5f3c812f9aca5408199401d95731498b149cea1b0a1fdd51e99d777f894844ed63e9226e094d8e626a03623014494dc433d1449e7409b30e69a6a0da005048ab8cfd917196244755609ab9031737c575a31237b51652b9ae3875851942e14c151a2e8d3fa357651d3ab31e2a049cd0253b2a492a8de140fcfeaf3eb25572ddf5175cf89e4842eaca3d9153f493708362ba4eee0cfb249736b9a215a439957c04a06290d202225cea7427837a87d54a60991868322f98edf3201726aeb63c0c2c907907bc483422c676e13c68423c559a9c2e28f332eb1853cbcf60f6c31fb9e2e8f09eb163c764220fe428c29b2a48b872551acc81d108350ca8a916c04bb7425ee8947ca42d2b0c8841ca039dadb881ad39aa25946e8cc6a684c88b503794f638ed902bbc341df56546fa6c1d5b6ae496f03d94794c91ab327224c8202bfae6b3ce3e3abc7cea1feeb817bc13aaf46689e591b1e9be43e34c02470271facd0dbcb939ca7863562590cb98ca952e8970dc60f1285fd568511eeb99d7296c046907a3a6610b6d6736b0522a23177d805c321d91abb219599627c7c07bdf971f7cf5ab5f7dd478dff6f63f17de29157e78cbfe7e7fdfa13126bdd4307c4b389e21c0e1379d13bfd40038b00a21d5069a483b50a6ae1d8d35a55537b481d1146913a70eacc3dbf664221772f56b07228b7460916b35c63832151f0ec6807cf125971d35583e884a3ff16fcf46a6b38148ead73d23fbfafcbd8363032311f052b991f2886e6afb748e968de05501e6f0222c644c931d70b5c717bf8371739cda28cc68dd60d60b5b07d6f364be51e4e2c9d119640a4d1e0a4401fbe4337b8efd171de75f70212d4ccf40e0bf7b869feff51d1808d17d102604b285709e0cc8cc21a3feb4a1234255b9f0ab0a0166e1cea90dd03abebaf98960ba77ba69759f328d6a832d312c25e73ab0b3e3511a400a8c29168381f7831ffae8b190eb3efbda534ef9dad71f7fbe77e4d73dc3bf3930da7330d037344e4ec7bda9dfe805a88a89262a0a8a079a35c5afdae48d04ba19dd11500b6657b4baeb2dfb70e6ab82591ae5c06669002d6ca359a7c908f2a07f7238107dec89a776ec383ebf50facb0bded3d31fd8db3bfa7cefe8be7ea378648232155524d1e357e8a40dab6beadd4c9f81ece2b7edd25da70fed947ac47d70d585d5512a1d554a9517e8568cd9cd602995fd31c4642800ded84517bff7d8c97577208a3ffb855b7b0e06f7f58eeeedf3ed8762a7d2501c4e311e248a6907d4a12b8ad5aeb24eb16c8786a896d58494108769d4a697ee1a2e26169c14131dd4274c1b52f9eab48d3224c88e59033be88b0cfa2304ef176ef9fbe3f87b06507376f6e4b7f7f41cf4efedf5edebf71f18248a23448d6f6c8aa9d19841763509c24520bbe6d1ce85dd999afd22c5d290c3d5fde84edc9038757cd6fe0829bfc22a32faae31e401acd7d46beeaaec43400d8c72268892449efdce8f76ed3afe3f18bee0a28bfb060308d7de5e3fc07b812caf06f2741b723e2ec756c34e49992b7550abf000080d3bc4b58d3936c64bf4cdca1286bd14606a1928443952e78722b5c40c4594029661081d810994079633d043be89615fe4c28b2e3e5e9e7cd87d2ebff2aa81e1f10303011293e5e2d0c1d109b69a0d67db590fd50edd287d2e9d111526f5b68d9edcac806c65c38af664067402683567de4616843f1be52155b9c880cb7a5b7a79cd96393199a2da39381cee1f0a0ffa264683b18fefbefab0451ec797af7ded299c360e8e847b0783e015cb8742fdc33a5b27099291439134050fa8d5f2a73573a3f063d0a446c3b05bfb20f832d74d30b4d14f23ec8797b39a3a7a85711ba968d514cea95384af433df0e49160ecfa1b6e6249c711e0efde8a73c31b6ffadca1d10990eeef0fec3fe8ef1908f60f8d0f4a27633e25a924a8d16d66c2e29ab30f01a7dfd7bc11d2ed875bfc5aa0636a935532c9754baebfd3a981ce860ca9753d1c6a93f7a9eeace0098f04a3377de6f3a79e7adaefaef0b8bf03e44fdd70f3902fd23f3486560379ffc120cb209c71363a32dc9bb287e92895bc4b580420d845ba8e7e4a6665dcd55e16f8177e4b5e134c66983aff62729e8053ee26691a31a487c60ea89a0d8f046237dcf899534f3b1160ddeee145bbafbe66c8374128a160f8f63e88ee424d66c4c3913280c338d8457a7b244b4e31f3c6b3bccf7fb9862b05738c536caaa61861e238a5a8e3e67d4321046ac43fc96cede576e3233ac925975cb6e707ff01d1b8194493a73aa8d11347b7018f831d149c4a63ec4097e9a85a000d23653f6c029396939dc46740ba7f207860307870647cd83fb9e707cf5df2de63ea088e08e4f77ff3ec73feecb6dbef1a0de272266207fd0e35f0592a0b26b401eeb0138360b172971f5d38d34ba20013c6910936ca8349a40c040e0c06fa8d567f287edb1df7f075bfffda5ea62b296cdef7fe0f3ef5ccf74602a01ea714d9d72faea9c4a0db316ed843bd87c63176a0dba8c601e830aa84c34f24089241dc060726e93cfdcc9ef77fe0c3c7b7823ac6dd38f3cc33775f75cd9e7f7f0eae074dbde92cf6f5f940ed8cc25b663b7084c77e5dc62ea1f96da4115f28bee787cf5d75d5353bcf7cc3312eef65faf88e1d3b3ff2b12b1efdfae381717e3dc2cfa2c89521d60f5ff273b0abe9d8d80455a72ac86113d70d41287b05a181f0d4a3fff2c4873f72f9ce9daf50a4dd1bc844e52d6f39f7937f7dfd638f3fe50b46036371481ff24f00ffe0f038324beec6fa86c678c99bd4c05c10188ffb42d1c71e7f9a0fbef5ad6f3b96b14cf7624ef0737ad277bef35d577fe2dadbefb8f79b4f3cfd9f3fff65dfc048703c8ef1e4a73fffe537bff5f4ed77de7bcd357ff5eef32f38f30d6f3cc1cbdbfebaed1dd8de81ed1dd8de81ed1dd8de8113b003ff0b5d29b05d0a656e6473747265616d0a656e646f626a0a31342030206f626a0a353731340a656e646f626a0a32362030206f626a0a3c3c202f4c656e67746820323720302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f576964746820313330202f48656967687420313338202f436f6c6f7253706163650a2f44657669636547726179202f496e746572706f6c6174652074727565202f42697473506572436f6d706f6e656e742038202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801edd03101000000c2a0fea9670d0f884061c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c08001032f0303d6dfd1f80a656e6473747265616d0a656e646f626a0a32372030206f626a0a3130320a656e646f626a0a32302030206f626a0a3c3c202f4c656e67746820323120302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f576964746820313334202f48656967687420313234202f436f6c6f7253706163650a2f44657669636547726179202f496e746572706f6c6174652074727565202f42697473506572436f6d706f6e656e742038202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801edd03101000000c2a0fea9670b2f884061c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c18f80c0c452aaad90a656e6473747265616d0a656e646f626a0a32312030206f626a0a39360a656e646f626a0a32382030206f626a0a3c3c202f4c656e67746820323920302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f5769647468203830202f486569676874203830202f436f6c6f7253706163650a2f44657669636547726179202f496e746572706f6c6174652074727565202f42697473506572436f6d706f6e656e742038202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed585d50135714cedddd6437bfe6ffc710214c483248486688c38f1502238c0682c068c4402a3f8a280630808043030845c18e523b38ad0e0f3a5aad4e6bd169dfead84e5bc74e715aacce68f5c519fbd0e9933eb5866997d1249bb07b77d13eba2fd93de7fbbe9c7bcebd67ef5e1eefedf53603ff570600c217c9941abd61f56a835ea39489f808786d6d8009e5fae23dc7e7e69f3c8b469f3d999f3bbea7582f1762af2309105cbea67e663efa6fd2159d9fa95f23c7571a25400955e1f8ed24a9f8c3edf1421581ae20480004caf5271ec50596dd3c3ab15e29005c150126cd8adc5b269264b817c99272cc2310a86bae2791691faed7a8051c22040861187848ab90627c38602058eb0230896d7a3185c9f0b8386d93b08c19f065ae59063a8d79d625e3c3c60cb055aeb3343c46d359d72a48846461d79e66e4d23a4eaf652e334045e6295a16c4386516314d6d843076a52c2f88d02b57b4cb4820b42d02f0355577d905521177ab34b4350198cc793e15cce5f9bc534653133279e9612ef4e598de749a1492abcc736b39968be5579a950750a975880b990e73c62a4dad3182eb3c3fd361b9d81e6fd5e1c9352697adf500172a3d66da9ab29001aec9bf468fe562bdf58e064f5ac7a8c4bc8d0b9109d36996a094494df6f7dc0813968bfd742ed9ff138288d0b081434b6656beb5c120a454049566fafe6146b37ba2c14c6962c080afc879979d04430ce62812ab1810da7507616876dfc9755a229e40446c2c9e66e7c010578a8de27802516946c5e73034bbefbb8a8c440231b9a5ea27760e0cf1a0ca22c7621386afb4d5fd0143b3fbfeaab329f9313d813adbff373b078678e1cf560b627ab836a7fe4df5ea73b4785c4f971b780afb7776df9f815c5d5c8fd039033fb2736088fb01a78e88c547ead57f0a43b3fbbea9a7e8e1ba5cff31760e0c71d14f192f598fba5e189addf7611da51ee47cf1ed61e7c010233eca7c21e77345eb1b4d9817e10aca7c26d79ba7ed32ecefd97cdfb67928eb8dec0745c137eaf79f048b28fd80ec57ee6d1d6c31c0fcc3dbdc947e45f65387b7e3331801eebbd9e57550fa29d9efada52d83700ecc7bb2a5d44ae9f73c549a5eb03df4038c02f3fd76687b417aa29df2788850efacda370ae3c07c67f65539f5d4f725f93ecff2040f7c0f2331fb7e792fe8c94a7a9ff350499abb26f4113307e69909d5b8d392f61b3c80abec65c1435fc3684cbeaf0683657655f27e88dcaf99dcd57ba77e672231db1f1cdd5bed36a5ecd77808aeb27902e18f397eba25e4174f85031e9b2a653fc903a8c4e8f2360faeb8ad5e186cf6ba8c92d4fd2e0f08e49985b5edc35f26fe9acbddd5487b6d61a69cba597bd9f5012ad4d84bfca1c32bdaa65e1b0df94bec1ae1b2f0783c80890d8ef260f7d81c97b85e62e6c6ba83e50e8398e67b8614e4cb4c79dee69eb14b1c8bb278e9704fb337cfc4f40d8ce00a73beaf393c320b39da4804ff687624dceccb372b526b1b7b6d2e1dba580a7c4d9d43d3371234a6bb1bd3439d4dbe020be428066022b525dfdbd8313076ee3e93ce4bfbfd73e3031d8dde7c8b5a449bbc5745c6442a735eb9bfad273279f931b3e2e3cb53919e367f799e5905935b2a32a130394a6a9b42fd239317efd02bdeb9706ca43fd4545be230290848744b3102149719ec85de1dbbbbfb87df9fbeba90f2c11e5db83a3331dcdfbd7b87b7d06e90e134132f568e574346f8624da6cb53ddd0d6d937343a71f4d4959b0b4f9f47a3cf9f2edcfce2cc0713a3437d9d6d0dd51e57a646cce93470e9d8cf6873976d09b47674f70d4646c6278e4c92d79189f191c8605f77476b604b99db66e47c100850814465b2bb3d955b1b5bdbf777857bfb0ef6f71feceb0d77ed6f6f6ddc5ae971db4d2a898075acb19103328b12555a96b3a07473adbf6167cbae36f2dad5b2b3c15fbbb9b4c09995a69290998b7f6fc478ccbf00c17089529f6e75b88b4a366eaaf45557fb2a376d2c29723bace97aa504c7584fc252c4c9180542a9426bccb0d8b273729dcedc9c6c9b25c3a8554885e44857105b5c1820289f104be54ab556475e5ab5522e15137c74a5a1c505c9e9486a627c018e13048e0bf818a9f53a915114577afb1fe93727760a656e6473747265616d0a656e646f626a0a32392030206f626a0a313533360a656e646f626a0a32332030206f626a0a3c3c202f4c656e67746820323420302052202f54797065202f584f626a656374202f53756274797065202f496d616765202f576964746820313238202f48656967687420313234202f436f6c6f7253706163650a2f44657669636547726179202f496e746572706f6c6174652074727565202f42697473506572436f6d706f6e656e742038202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801edd03101000000c2a0fea9670d0f884061c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c0800103060c183060c08001030f030354c3c5940a656e6473747265616d0a656e646f626a0a32342030206f626a0a39330a656e646f626a0a33302030206f626a0a3c3c202f4c656e67746820333120302052202f4e2033202f416c7465726e617465202f446576696365524742202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a78019d96775453d91687cfbd37bdd012222025f41a7a0920d23b48150451894980500286842676440546141129566454c0014787226345140b838262d709f21050c6c1514445e5dd8c6b09efad35f3de9afdc759dfd9e7b7d7d967ef7dd7ba0050fc8204c27458018034a15814eeebc15c1213cbc4f7021810010e5801c0e166660447f84402d4fcbd3d9999a848c6b3f6ee2e8064bbdb2cbf502673d6ff7f912237432406000a45d5363c7e2617e5029453b3c51932ff04caf495293286313216a109a2ac22e3c4af6cf6a7e62bbbc9989726e4a11a59ce19bc349e8cbb50de9a25e1a38c04a15c9825e067a37c0765bd54499a00e5f728d3d3f89c4c003014995fcce726a16c8932451419ee89f202000894c439bc720e8bf939689e0078a667e48a04894962a611d79869e5e8c866faf1b353f962312b94c34de188784ccff4b40c8e301780af6f96450125596d996891edad1ceded59d6e668f9bfd9df1e7e53fd3dc87afb55f126eccf9e418c9e59df6cecac2fbd1600f6245a9b1db3be955500b46d0640e5e1ac4fef2000f20500b4de9cf31e866c5e92c4e20c270b8becec6c73019f6b2e2be837fb9f826fcabf8639f799cbeefb563ba6173f81234915336545e5a6a7a64b44cccc0c0e97cf64fdf710ffe3c03969cdc9c32c9c9fc017f185e85551e89409848968bb853c8158902e640a847fd5e17f18362707197e9d6b1468755f007d853950b84907c86f3d00432303246e3f7a027deb5b10310ac8bebc68ad91af738f327afee7fa1f0b5c8a6ee14c412253e6f60c8f647225a22c19a3df846cc10212900774a00a34812e30022c600d1c80337003de2000848048100396032e4802694004b2413ed8000a4131d80176836a7000d4817ad0044e823670065c0457c00d700b0c8047400a86c14b3001de81690882f01015a241aa9016a40f9942d6101b5a0879434150381403c5438990109240f9d026a8182a83aaa143503df423741aba085d83faa007d0203406fd017d84119802d3610dd800b680d9b03b1c0847c2cbe04478159c0717c0dbe14ab8163e0eb7c217e11bf0002c855fc2930840c80803d14658081bf144429058240111216b9122a402a9459a900ea41bb98d489171e4030687a161981816c619e387598ce1625661d6624a30d5986398564c17e63666103381f982a562d5b1a65827ac3f760936119b8d2dc456608f605bb097b103d861ec3b1c0ec7c019e21c707eb8185c326e35ae04b70fd78cbb80ebc30de126f178bc2ade14ef820fc173f0627c21be0a7f1c7f1edf8f1fc6bf2790095a046b820f219620246c2454101a08e708fd8411c2345181a84f7422861079c45c6229b18ed841bc491c264e93144986241752242999b48154496a225d263d26bd2193c93a6447721859405e4fae249f205f250f923f50942826144f4a1c4542d94e394ab94079407943a5520da86ed458aa98ba9d5a4fbd447d4a7d2f47933397f397e3c9ad93ab916b95eb977b254f94d79777975f2e9f275f217f4afea6fcb80251c140c15381a3b056a146e1b4c23d8549459aa2956288629a62896283e235c55125bc928192b7124fa940e9b0d225a5211a42d3a579d2b8b44db43ada65da301d4737a4fbd393e9c5f41fe8bdf4096525655be528e51ce51ae5b3ca5206c23060f8335219a58c938cbb8c8ff334e6b9cfe3cfdb36af695effbc2995f92a6e2a7c952295669501958faa4c556fd514d59daa6daa4fd4306a266a616ad96afbd52eab8dcfa7cf779ecf9d5f34ffe4fc87eab0ba897ab8fa6af5c3ea3dea931a9a1abe1a191a551a9734c635199a6e9ac99ae59ae734c7b4685a0bb5045ae55ae7b55e309599eecc546625b38b39a1adaeeda72dd13ea4ddab3dad63a8b35867a34eb3ce135d922e5b3741b75cb75377424f4b2f582f5faf51efa13e519fad9fa4bf47bf5b7fcac0d020da608b419bc1a8a18aa1bf619e61a3e16323aa91abd12aa35aa33bc63863b6718af13ee35b26b0899d4992498dc94d53d8d4de5460bacfb4cf0c6be6682634ab35bbc7a2b0dc5959ac46d6a039c33cc87ca3799bf92b0b3d8b588b9d16dd165f2ced2c532deb2c1f59295905586db4eab0fac3dac49a6b5d637dc7866ae363b3cea6dde6b5ada92ddf76bfed7d3b9a5db0dd16bb4ebbcff60ef622fb26fb31073d877887bd0ef7d8747628bb847dd511ebe8e1b8cef18ce307277b27b1d349a7df9d59ce29ce0dcea30b0c17f017d42d1872d171e1b81c72912e642e8c5f7870a1d455db95e35aebfacc4dd78de776c46dc4ddd83dd9fdb8fb2b0f4b0f91478bc794a793e71acf0b5e8897af579157afb792f762ef6aefa73e3a3e893e8d3e13be76beab7d2ff861fd02fd76faddf3d7f0e7fad7fb4f043804ac09e80aa404460456073e0b320912057504c3c101c1bb821f2fd25f245cd4160242fc4376853c09350c5d15fa73182e2c34ac26ec79b855787e7877042d62454443c4bb488fc8d2c8478b8d164b167746c947c545d5474d457b4597454b97582c59b3e4468c5a8c20a63d161f1b157b247672a9f7d2dd4b87e3ece20ae3ee2e335c96b3ecda72b5e5a9cbcfae905fc159712a1e1b1f1ddf10ff8913c2a9e54caef45fb977e504d793bb87fb92e7c62be78df15df865fc91049784b284d14497c45d896349ae491549e3024f41b5e075b25ff281e4a9949094a32933a9d1a9cd6984b4f8b4d34225618ab02b5d333d27bd2fc334a33043baca69d5ee5513a240d1914c28735966bb988efe4cf5488c249b2583590bb36ab2de6747659fca51cc11e6f4e49ae46ecb1dc9f3c9fb7e356635777567be76fe86fcc135ee6b0ead85d6ae5cdbb94e775dc1bae1f5beeb8f6d206d48d9f0cb46cb8d651bdf6e8aded451a051b0be6068b3efe6c642b94251e1bd2dce5b0e6cc56c156ceddd66b3ad6adb97225ed1f562cbe28ae24f25dc92ebdf597d57f9ddccf684edbda5f6a5fb77e0760877dcdde9baf3589962595ed9d0aee05dade5ccf2a2f2b7bb57ecbe56615b71600f698f648fb432a8b2bd4aaf6a47d5a7eaa4ea811a8f9ae6bdea7bb7ed9ddac7dbd7bfdf6d7fd3018d03c5073e1e141cbc7fc8f7506bad416dc561dce1acc3cfeba2eababf677f5f7f44ed48f191cf478547a5c7c28f75d53bd4d737a8379436c28d92c6b1e371c76ffde0f5437b13abe95033a3b9f804382139f1e2c7f81fef9e0c3cd9798a7daae927fd9ff6b6d05a8a5aa1d6dcd689b6a436697b4c7bdfe980d39d1dce1d2d3f9bff7cf48cf6999ab3ca674bcf91ce159c9b399f777ef242c685f18b8917873a57743ebab4e4d29daeb0aedecb8197af5ef1b972a9dbbdfbfc5597ab67ae395d3b7d9d7dbded86fd8dd61ebb9e965fec7e69e9b5ef6dbde970b3fd96e3ad8ebe057de7fa5dfb2fdef6ba7de58eff9d1b038b06faee2ebe7bff5edc3de97ddefdd107a90f5e3fcc7a38fd68fd63ece3a2270a4f2a9eaa3fadfdd5f8d766a9bdf4eca0d760cfb388678f86b8432fff95f9af4fc305cfa9cf2b46b446ea47ad47cf8cf98cdd7ab1f4c5f0cb8c97d3e385bf29feb6f795d1ab9f7e77fbbd6762c9c4f06bd1eb993f4adea8be39fad6f66de764e8e4d37769efa6a78adeabbe3ff681fda1fb63f4c791e9ec4ff84f959f8d3f777c09fcf278266d66e6dff784f3fb0a656e6473747265616d0a656e646f626a0a33312030206f626a0a323631320a656e646f626a0a372030206f626a0a5b202f494343426173656420333020302052205d0a656e646f626a0a33322030206f626a0a3c3c202f4c656e67746820333320302052202f4e2033202f416c7465726e617465202f446576696365524742202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ad57675853c91a9e53929090d002a14809bd8952a44b09a14550902ad8084920a1c4981044ecc8a2826b1711b0a1ab228aae05103bf6b228f6be288bcacaba58b0a172e72480dedd3ff7c73dcf3373de79e7eb3327990140bb9a2f93e5a03a00e44af3e4711121ec0929a96c4a0720032d600874018d2f50c838b1b1d1003e836f027f7fdedf060831bae142d8faceff4f4857285208004062a174ba5021c885f8200078b14026cf0380ec0379eb197932024f82585f0e03845846e04c352e2670ba1a57a86412e2b8506637001a743e5f9e09805613e4d9f9824c6847eb2ec4ae52a1440a80b606c48102315f087124c4c37373a71118ca0187f41fec64fe80f9fcf4219b7c7ee61056e70235a1e350894296c39fa91afc3fbbdc1c25ac97eab1833d5d2c8f8c836f7d58b7bbd9d3a2084c87b85b9a3e2e06623d883f4a60466a8cd2c4cac84488a13c6a2a5070612d010b6257213f340a625388c3a539e388f526f8f40c49380f62b843d002491e2f01624277b14811160f31b48f56cba7c50df842ab33e45cce806e3d5f0e915afe8c323b91e009fb77c522dea0fd7785e28464c8c398315abe24691cc45a10b314d9f1443c3006cca650cc2578958c5c1947c46f03793f9134220462180f3625431e4ee44ec8cb731510a962c3168b253c4217c68955e68913883526ecec16f055f11b41dc249272066a824d11292610b1a9f2128a42c32086b963d744d2c4817cb176595e08e18bd07d23cb517d1b501ea789722208de0a6253457efc802e1e98274f207818273e4e96174bd410c689a767f1c710fb1ec683178068c005a1800d94b0a58369200b485abb1bbbe1483d130ef8400e328108b80c30831ac9aa1929ece34121f80b48a18c62482f44352b02f990ff3ac4aa755d40866a365fa5910d9e410fb9200ae4c0b1126211d419f49604fe808c64683ce85d0063cd818d98fb37c781594543af849472d02e5b7b50921c460e254792c3c98eb8091e88fbe3d1b00f86cd1df7c17d07a3fd2e4f7a466a233d25dd22b593ee4d9514c9072506ed81b1a01dfa51d74a04ebf843ceb81db4ea8987e001d03eb48db37013e0828f829e387810f4ed0959ee403644f68395ff31aba11cc0f7aa0fc8515da928d5901a4c75f8a7a6969396e75084444dd5f550574d1d6bfa505d0723f8b7ffef3312208471460dc43a24892dc60e60e7b153d845ec28d608d8d809ac09bb821d23f080ff70d52a660e798b53ad71365c19c990cc60be7cc8103e897da070ad73ed72fda2b692272ac883fb1670a7c966ca2599e23c3607fef28bd83ca960c470b6bbab9b2f00c4ff082103c05b96eaff01615dface2dbc0c40c0c5fefefe23dfb9a80c00f69f0680f6839cfd36f56ff1851d02a53c5f6d0f275e244003daf08b3206e6c01a38c07cdc8117f007c1200c8c01312001a4802970d789e17e968319603658004a40195801d6824ab0096c053bc11eb01f3482a3e01438072e836be0167800774f2778097ac07bd08720080561204cc418b1406c1167c41df141029130241a8943529034241391224a6436b2102943562195c816a416f915398c9c422e226dc83de409d285bc413ea3184a47f55133d40e1d89faa01c340a4d4027a399e874b4102d4697a115680dba1b6d404fa197d15b683bfa12edc500a689b1304bcc05f3c1b8580c968a6560726c2e568a956335583dd60cd7f906d68e75639f7032cec4d9b80bdcc19178222ec0a7e373f1a57825be136fc0cfe037f027780ffe8dc42099929c497e241e69022993348354422a276d271d229d855f5327e93d994c6691edc9def06b4c216791679197923790f7924f92dbc81de45e0a85624c71a6045062287c4a1ea584b29eb29b7282729dd249f9a8a1a961a1e1ae11ae91aa21d528d228d7d8a5715ce3bac6738d3eaa0ed596ea478da10aa933a9cba9dba8cdd4abd44e6a1f4d97664f0ba025d0b2680b6815b47ada59da43da5b4d4d4d2b4d5fcdf19a12cdf99a159afb342f683ed1fc44d7a33bd1b9f44974257d197d07fd24fd1efd2d83c1b06304335219798c658c5ac669c663c6472da6d6082d9e96506b9e56955683d675ad57da546d5b6d8ef614ed42ed72ed03da57b5bb75a83a763a5c1dbece5c9d2a9dc33a77747a7599ba6eba31bab9ba4b7577e95ed47da147d1b3d30bd313ea15eb6dd53badd7c1c498d64c2e53c05cc8dcc63ccbecd427ebdbebf3f4b3f4cbf4f7e8b7eaf718e8198c3248322830a8323866d0cec258762c1e2b87b59cb59f759bf5d9d0cc906328325c62586f78ddf083d130a360239151a9d15ea35b469f8dd9c661c6d9c62b8d1b8d1f99e0264e26e34d66986c34396bd23d4c7f98ff30c1b0d261fb87dd37454d9d4ce34c67996e35bd62da6b666e166126335b6f76daacdb9c651e6c9e65bec6fcb8799705d322d04262b1c6e284c59f6c0336879dc3ae609f61f7589a5a465a2a2db758b65af659d95b255a1559edb57a644db3f6b1ceb05e63dd62dd63636133d666b64d9dcd7d5baaad8fadd8769ded79db0f76f676c9768bec1aed5ed81bd9f3ec0bedebec1f3a301c821ca63bd438dc74243bfa38663b6e70bce6843a793a899daa9cae3aa3ce5ece12e70dce6dc349c37d874b87d70cbfe34277e1b8e4bbd4b93c19c11a113da26844e38857236d46a68e5c39f2fcc86fae9eae39aedb5c1fb8e9b98d712b726b767be3eee42e70af72bfe9c1f008f798e7d1e4f17a94f328d1a88da3ee7a323dc77a2ef26cf1fceae5ed25f7aaf7eaf2b6f14ef3aef6bee3a3ef13ebb3d4e7822fc937c4779eef51df4f7e5e7e797efbfdfef677f1cff6dfe5ff62b4fd68d1e86da33b02ac02f8015b02da03d98169819b03db832c83f84135414f83ad8385c1db839f731c39599cdd9c5721ae21f29043211fb87edc39dc93a15868446869686b985e58625865d8e370abf0ccf0baf09e08cf8859112723499151912b23eff0cc78025e2daf678cf7983963ce44d1a3e2a32aa39e463b45cba39bc7a263c78c5d3df6e138db71d2718d31208617b33ae651ac7decf4d823e3c9e363c7578d7f16e716373bee7c3c337e6afcaef8f7092109cb131e243a242a135b92b4932625d5267d480e4d5e95dc3e61e48439132ea798a448529a5229a949a9db537b27864d5c3bb17392e7a49249b727db4f2e987c718ac9949c29c7a66a4fe54f3d90464a4b4edb95f6851fc3afe1f7a6f3d2abd37b045cc13ac14b61b0708db04b14205a257a9e1190b12ae3456640e6eacc2e7190b85cdc2de14a2a25afb322b336657dc88ec9de91dd9f939cb3375723372df7b0544f9a2d3d33cd7c5ac1b43699b3ac44d63edd6ffadae93df228f97605a298ac68cad38707f62b4a07e54fca27f981f955f91f6724cd3850a05b202db832d369e69299cf0bc30b7f9985cf12cc6a996d397bc1ec27733873b6cc45e6a6cf6d99673daf785ee7fc88f93b17d016642ff8adc8b56855d1');
SELECT pg_catalog.lowrite(0, '\xbb85c90b9b8bcd8ae71777fc14f1535d895689bce4ce22ff459b16e38b258b5b97782c59bfe45ba9b0f452996b5979d997a582a5977e76fbb9e2e7fe6519cb5a977b2ddfb882bc42bae2f6caa0953b57e9ae2a5cd5b17aecea8635ec35a56bdead9dbaf662f9a8f24deb68eb94ebda2ba22b9ad6dbac5fb1fe4ba5b8f2565548d5de6ad3ea25d51f3608375cdf18bcb17e93d9a6b24d9f374b36dfdd12b1a5a1c6aea67c2b796bfed667db92b69dffc5e797daed26dbcbb67fdd21ddd1be336ee7995aefdada5da6bb96d7a175cabaaedd93765fdb13baa7a9dea57ecb5ed6deb27d609f72df9fbfa6fd7a7b7fd4fe96033e07ea0fda1eac3ec43c54da8034cc6ce8691437b637a534b51d1e73b8a5d9bff9d0911147761cb53c5a75cce0d8f2e3b4e3c5c7fb4f149ee83d293bd97d2af35447cbd49607a7279cbe7966fc99d6b351672f9c0b3f77fa3ce7fc890b01178e5ef4bb78f892cfa5c6cb5e971bae785e39f49be76f875abd5a1bae7a5f6dbae67badb96d74dbf1eb41d74fdd08bd71ee26efe6e55be36eb5dd4ebc7df7cea43bed7785775fdccbb9f7fa7efefdbe07f31f921e963ed27954fed8f471cdef8ebfef6df76a3ff624f4c995a7f14f1f74083a5efea1f8e34b67f133c6b3f2e716cf6b5fb8bf38da15de75edcf897f76be94bdeceb2ef94bf7afea570eaf0efe1dfcf7959e093d9dafe5affbdf2c7d6bfc76c7bb51ef5a7a637b1fbfcf7ddff7a1f4a3f1c79d9f7c3e9dff9cfcf979df8c2f942f155f1dbf367f8bfaf6b03fb7bf5fc697f35567010cf668063c37bcd90100230500e635787e98a8bee7a92410f5dd146264a011f43fb0fa2e484cc03304a8872fe2b8ce3d09c03ed8ec82e1950436e2a89e100c500f8fa10619e2516478b8ab004297c3a3c9c7fefeb76600509a01f82aefefefdbd0dfff159e63b07b009c9caebe5f12d26478afd8ec4aa0eb160788d77f3dff018fa27fe40a656e6473747265616d0a656e646f626a0a33332030206f626a0a333138330a656e646f626a0a31392030206f626a0a5b202f494343426173656420333220302052205d0a656e646f626a0a33342030206f626a0a3c3c202f4c656e67746820333520302052202f4e2033202f416c7465726e617465202f446576696365524742202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ad57675853c91a9e53929090d002a14809bd8952a44b09a14550902ad8084920a1c4981044ecc8a2826b1711b0a1ab228aae05103bf6b228f6be288bcacaba58b0a172e72480dedd3ff7c73dcf3373de79e7eb3327990140bb9a2f93e5a03a00e44af3e4711121ec0929a96c4a0720032d600874018d2f50c838b1b1d1003e836f027f7fdedf060831bae142d8faceff4f4857285208004062a174ba5021c885f8200078b14026cf0380ec0379eb197932024f82585f0e03845846e04c352e2670ba1a57a86412e2b8506637001a743e5f9e09805613e4d9f9824c6847eb2ec4ae52a1440a80b606c48102315f087124c4c37373a71118ca0187f41fec64fe80f9fcf4219b7c7ee61056e70235a1e350894296c39fa91afc3fbbdc1c25ac97eab1833d5d2c8f8c836f7d58b7bbd9d3a2084c87b85b9a3e2e06623d883f4a60466a8cd2c4cac84488a13c6a2a5070612d010b6257213f340a625388c3a539e388f526f8f40c49380f62b843d002491e2f01624277b14811160f31b48f56cba7c50df842ab33e45cce806e3d5f0e915afe8c323b91e009fb77c522dea0fd7785e28464c8c398315abe24691cc45a10b314d9f1443c3006cca650cc2578958c5c1947c46f03793f9134220462180f3625431e4ee44ec8cb731510a962c3168b253c4217c68955e68913883526ecec16f055f11b41dc249272066a824d11292610b1a9f2128a42c32086b963d744d2c4817cb176595e08e18bd07d23cb517d1b501ea789722208de0a6253457efc802e1e98274f207818273e4e96174bd410c689a767f1c710fb1ec683178068c005a1800d94b0a58369200b485abb1bbbe1483d130ef8400e328108b80c30831ac9aa1929ece34121f80b48a18c62482f44352b02f990ff3ac4aa755d40866a365fa5910d9e410fb9200ae4c0b1126211d419f49604fe808c64683ce85d0063cd818d98fb37c781594543af849472d02e5b7b50921c460e254792c3c98eb8091e88fbe3d1b00f86cd1df7c17d07a3fd2e4f7a466a233d25dd22b593ee4d9514c9072506ed81b1a01dfa51d74a04ebf843ceb81db4ea8987e001d03eb48db37013e0828f829e387810f4ed0959ee403644f68395ff31aba11cc0f7aa0fc8515da928d5901a4c75f8a7a6969396e75084444dd5f550574d1d6bfa505d0723f8b7ffef3312208471460dc43a24892dc60e60e7b153d845ec28d608d8d809ac09bb821d23f080ff70d52a660e798b53ad71365c19c990cc60be7cc8103e897da070ad73ed72fda2b692272ac883fb1670a7c966ca2599e23c3607fef28bd83ca960c470b6bbab9b2f00c4ff082103c05b96eaff01615dface2dbc0c40c0c5fefefe23dfb9a80c00f69f0680f6839cfd36f56ff1851d02a53c5f6d0f275e244003daf08b3206e6c01a38c07cdc8117f007c1200c8c01312001a4802970d789e17e968319603658004a40195801d6824ab0096c053bc11eb01f3482a3e01438072e836be0167800774f2778097ac07bd08720080561204cc418b1406c1167c41df141029130241a8943529034241391224a6436b2102943562195c816a416f915398c9c422e226dc83de409d285bc413ea3184a47f55133d40e1d89faa01c340a4d4027a399e874b4102d4697a115680dba1b6d404fa197d15b683bfa12edc500a689b1304bcc05f3c1b8580c968a6560726c2e568a956335583dd60cd7f906d68e75639f7032cec4d9b80bdcc19178222ec0a7e373f1a57825be136fc0cfe037f027780ffe8dc42099929c497e241e69022993348354422a276d271d229d855f5327e93d994c6691edc9def06b4c216791679197923790f7924f92dbc81de45e0a85624c71a6045062287c4a1ea584b29eb29b7282729dd249f9a8a1a961a1e1ae11ae91aa21d528d228d7d8a5715ce3bac6738d3eaa0ed596ea478da10aa933a9cba9dba8cdd4abd44e6a1f4d97664f0ba025d0b2680b6815b47ada59da43da5b4d4d4d2b4d5fcdf19a12cdf99a159afb342f683ed1fc44d7a33bd1b9f44974257d197d07fd24fd1efd2d83c1b06304335219798c658c5ac669c663c6472da6d6082d9e96506b9e56955683d675ad57da546d5b6d8ef614ed42ed72ed03da57b5bb75a83a763a5c1dbece5c9d2a9dc33a77747a7599ba6eba31bab9ba4b7577e95ed47da147d1b3d30bd313ea15eb6dd53badd7c1c498d64c2e53c05cc8dcc63ccbecd427ebdbebf3f4b3f4cbf4f7e8b7eaf718e8198c3248322830a8323866d0cec258762c1e2b87b59cb59f759bf5d9d0cc906328325c62586f78ddf083d130a360239151a9d15ea35b469f8dd9c661c6d9c62b8d1b8d1f99e0264e26e34d66986c34396bd23d4c7f98ff30c1b0d261fb87dd37454d9d4ce34c67996e35bd62da6b666e166126335b6f76daacdb9c651e6c9e65bec6fcb8799705d322d04262b1c6e284c59f6c0336879dc3ae609f61f7589a5a465a2a2db758b65af659d95b255a1559edb57a644db3f6b1ceb05e63dd62dd63636133d666b64d9dcd7d5baaad8fadd8769ded79db0f76f676c9768bec1aed5ed81bd9f3ec0bedebec1f3a301c821ca63bd438dc74243bfa38663b6e70bce6843a793a899daa9cae3aa3ce5ece12e70dce6dc349c37d874b87d70cbfe34277e1b8e4bbd4b93c19c11a113da26844e38857236d46a68e5c39f2fcc86fae9eae39aedb5c1fb8e9b98d712b726b767be3eee42e70af72bfe9c1f008f798e7d1e4f17a94f328d1a88da3ee7a323dc77a2ef26cf1fceae5ed25f7aaf7eaf2b6f14ef3aef6bee3a3ef13ebb3d4e7822fc937c4779eef51df4f7e5e7e797efbfdfef677f1cff6dfe5ff62b4fd68d1e86da33b02ac02f8015b02da03d98169819b03db832c83f84135414f83ad8385c1db839f731c39599cdd9c5721ae21f29043211fb87edc39dc93a15868446869686b985e58625865d8e370abf0ccf0baf09e08cf8859112723499151912b23eff0cc78025e2daf678cf7983963ce44d1a3e2a32aa39e463b45cba39bc7a263c78c5d3df6e138db71d2718d31208617b33ae651ac7decf4d823e3c9e363c7578d7f16e716373bee7c3c337e6afcaef8f7092109cb131e243a242a135b92b4932625d5267d480e4d5e95dc3e61e48439132ea798a448529a5229a949a9db537b27864d5c3bb17392e7a49249b727db4f2e987c718ac9949c29c7a66a4fe54f3d90464a4b4edb95f6851fc3afe1f7a6f3d2abd37b045cc13ac14b61b0708db04b14205a257a9e1190b12ae3456640e6eacc2e7190b85cdc2de14a2a25afb322b336657dc88ec9de91dd9f939cb3375723372df7b0544f9a2d3d33cd7c5ac1b43699b3ac44d63edd6ffadae93df228f97605a298ac68cad38707f62b4a07e54fca27f981f955f91f6724cd3850a05b202db832d369e69299cf0bc30b7f9985cf12cc6a996d397bc1ec27733873b6cc45e6a6cf6d99673daf785ee7fc88f93b17d016642ff8adc8b56855d1bb85c90b9b8bcd8ae71777fc14f1535d895689bce4ce22ff459b16e38b258b5b97782c59bfe45ba9b0f452996b5979d997a582a5977e76fbb9e2e7fe6519cb5a977b2ddfb882bc42bae2f6caa0953b57e9ae2a5cd5b17aecea8635ec35a56bdead9dbaf662f9a8f24deb68eb94ebda2ba22b9ad6dbac5fb1fe4ba5b8f2565548d5de6ad3ea25d51f3608375cdf18bcb17e93d9a6b24d9f374b36dfdd12b1a5a1c6aea67c2b796bfed667db92b69dffc5e797daed26dbcbb67fdd21ddd1be336ee7995aefdada5da6bb96d7a175cabaaedd93765fdb13baa7a9dea57ecb5ed6deb27d609f72df9fbfa6fd7a7b7fd4fe96033e07ea0fda1eac3ec43c54da8034cc6ce8691437b637a534b51d1e73b8a5d9bff9d0911147761cb53c5a75cce0d8f2e3b4e3c5c7fb4f149ee83d293bd97d2af35447cbd49607a7279cbe7966fc99d6b351672f9c0b3f77fa3ce7fc890b01178e5ef4bb78f892cfa5c6cb5e971bae785e39f49be76f875abd5a1bae7a5f6dbae67badb96d74dbf1eb41d74fdd08bd71ee26efe6e55be36eb5dd4ebc7df7cea43bed7785775fdccbb9f7fa7efefdbe07f31f921e963ed27954fed8f471cdef8ebfef6df76a3ff624f4c995a7f14f1f74083a5efea1f8e34b67f133c6b3f2e716cf6b5fb8bf38da15de75edcf897f76be94bdeceb2ef94bf7afea570eaf0efe1dfcf7959e093d9dafe5affbdf2c7d6bfc76c7bb51ef5a7a637b1fbfcf7ddff7a1f4a3f1c79d9f7c3e9dff9cfcf979df8c2f942f155f1dbf367f8bfaf6b03fb7bf5fc697f35567010cf668063c37bcd90100230500e635787e98a8bee7a92410f5dd146264a011f43fb0fa2e484cc03304a8872fe2b8ce3d09c03ed8ec82e1950436e2a89e100c500f8fa10619e2516478b8ab004297c3a3c9c7fefeb76600509a01f82aefefefdbd0dfff159e63b07b009c9caebe5f12d26478afd8ec4aa0eb160788d77f3dff018fa27fe40a656e6473747265616d0a656e646f626a0a33352030206f626a0a333138330a656e646f626a0a32322030206f626a0a5b202f494343426173656420333420302052205d0a656e646f626a0a33362030206f626a0a3c3c202f4c656e67746820333720302052202f4e2033202f416c7465726e617465202f446576696365524742202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ad57675853c91a9e53929090d002a14809bd8952a44b09a14550902ad8084920a1c4981044ecc8a2826b1711b0a1ab228aae05103bf6b228f6be288bcacaba58b0a172e72480dedd3ff7c73dcf3373de79e7eb3327990140bb9a2f93e5a03a00e44af3e4711121ec0929a96c4a0720032d600874018d2f50c838b1b1d1003e836f027f7fdedf060831bae142d8faceff4f4857285208004062a174ba5021c885f8200078b14026cf0380ec0379eb197932024f82585f0e03845846e04c352e2670ba1a57a86412e2b8506637001a743e5f9e09805613e4d9f9824c6847eb2ec4ae52a1440a80b606c48102315f087124c4c37373a71118ca0187f41fec64fe80f9fcf4219b7c7ee61056e70235a1e350894296c39fa91afc3fbbdc1c25ac97eab1833d5d2c8f8c836f7d58b7bbd9d3a2084c87b85b9a3e2e06623d883f4a60466a8cd2c4cac84488a13c6a2a5070612d010b6257213f340a625388c3a539e388f526f8f40c49380f62b843d002491e2f01624277b14811160f31b48f56cba7c50df842ab33e45cce806e3d5f0e915afe8c323b91e009fb77c522dea0fd7785e28464c8c398315abe24691cc45a10b314d9f1443c3006cca650cc2578958c5c1947c46f03793f9134220462180f3625431e4ee44ec8cb731510a962c3168b253c4217c68955e68913883526ecec16f055f11b41dc249272066a824d11292610b1a9f2128a42c32086b963d744d2c4817cb176595e08e18bd07d23cb517d1b501ea789722208de0a6253457efc802e1e98274f207818273e4e96174bd410c689a767f1c710fb1ec683178068c005a1800d94b0a58369200b485abb1bbbe1483d130ef8400e328108b80c30831ac9aa1929ece34121f80b48a18c62482f44352b02f990ff3ac4aa755d40866a365fa5910d9e410fb9200ae4c0b1126211d419f49604fe808c64683ce85d0063cd818d98fb37c781594543af849472d02e5b7b50921c460e254792c3c98eb8091e88fbe3d1b00f86cd1df7c17d07a3fd2e4f7a466a233d25dd22b593ee4d9514c9072506ed81b1a01dfa51d74a04ebf843ceb81db4ea8987e001d03eb48db37013e0828f829e387810f4ed0959ee403644f68395ff31aba11cc0f7aa0fc8515da928d5901a4c75f8a7a6969396e75084444dd5f550574d1d6bfa505d0723f8b7ffef3312208471460dc43a24892dc60e60e7b153d845ec28d608d8d809ac09bb821d23f080ff70d52a660e798b53ad71365c19c990cc60be7cc8103e897da070ad73ed72fda2b692272ac883fb1670a7c966ca2599e23c3607fef28bd83ca960c470b6bbab9b2f00c4ff082103c05b96eaff01615dface2dbc0c40c0c5fefefe23dfb9a80c00f69f0680f6839cfd36f56ff1851d02a53c5f6d0f275e244003daf08b3206e6c01a38c07cdc8117f007c1200c8c01312001a4802970d789e17e968319603658004a40195801d6824ab0096c053bc11eb01f3482a3e01438072e836be0167800774f2778097ac07bd08720080561204cc418b1406c1167c41df141029130241a8943529034241391224a6436b2102943562195c816a416f915398c9c422e226dc83de409d285bc413ea3184a47f55133d40e1d89faa01c340a4d4027a399e874b4102d4697a115680dba1b6d404fa197d15b683bfa12edc500a689b1304bcc05f3c1b8580c968a6560726c2e568a956335583dd60cd7f906d68e75639f7032cec4d9b80bdcc19178222ec0a7e373f1a57825be136fc0cfe037f027780ffe8dc42099929c497e241e69022993348354422a276d271d229d855f5327e93d994c6691edc9def06b4c216791679197923790f7924f92dbc81de45e0a85624c71a6045062287c4a1ea584b29eb29b7282729dd249f9a8a1a961a1e1ae11ae91aa21d528d228d7d8a5715ce3bac6738d3eaa0ed596ea478da10aa933a9cba9dba8cdd4abd44e6a1f4d97664f0ba025d0b2680b6815b47ada59da43da5b4d4d4d2b4d5fcdf19a12cdf99a159afb342f683ed1fc44d7a33bd1b9f44974257d197d07fd24fd1efd2d83c1b06304335219798c658c5ac669c663c6472da6d6082d9e96506b9e56955683d675ad57da546d5b6d8ef614ed42ed72ed03da57b5bb75a83a763a5c1dbece5c9d2a9dc33a77747a7599ba6eba31bab9ba4b7577e95ed47da147d1b3d30bd313ea15eb6dd53badd7c1c498d64c2e53c05cc8dcc63ccbecd427ebdbebf3f4b3f4cbf4f7e8b7eaf718e8198c3248322830a8323866d0cec258762c1e2b87b59cb59f759bf5d9d0cc906328325c62586f78ddf083d130a360239151a9d15ea35b469f8dd9c661c6d9c62b8d1b8d1f99e0264e26e34d66986c34396bd23d4c7f98ff30c1b0d261fb87dd37454d9d4ce34c67996e35bd62da6b666e166126335b6f76daacdb9c651e6c9e65bec6fcb8799705d322d04262b1c6e284c59f6c0336879dc3ae609f61f7589a5a465a2a2db758b65af659d95b255a1559edb57a644db3f6b1ceb05e63dd62dd63636133d666b64d9dcd7d5baaad8fadd8769ded79db0f76f676c9768bec1aed5ed81bd9f3ec0bedebec1f3a301c821ca63bd438dc74243bfa38663b6e70bce6843a793a899daa9cae3aa3ce5ece12e70dce6dc349c37d874b87d70cbfe34277e1b8e4bbd4b93c19c11a113da26844e38857236d46a68e5c39f2fcc86fae9eae39aedb5c1fb8e9b98d712b726b767be3eee42e70af72bfe9c1f008f798e7d1e4f17a94f328d1a88da3ee7a323dc77a2ef26cf1fceae5ed25f7aaf7eaf2b6f14ef3aef6bee3a3ef13ebb3d4e7822fc937c4779eef51df4f7e5e7e797efbfdfef677f1cff6dfe5ff62b4fd68d1e86da33b02ac02f8015b02da03d98169819b03db832c83f84135414f83ad8385c1db839f731c39599cdd9c5721ae21f29043211fb87edc39dc93a15868446869686b985e58625865d8e370abf0ccf0baf09e08cf8859112723499151912b23eff0cc78025e2daf678cf7983963ce44d1a3e2a32aa39e463b45cba39bc7a263c78c5d3df6e138db71d2718d31208617b33ae651ac7decf4d823e3c9e363c7578d7f16e716373bee7c3c337e6afcaef8f7092109cb131e243a242a135b92b4932625d5267d480e4d5e95dc3e61e48439132ea798a448529a5229a949a9db537b27864d5c3bb17392e7a49249b727db4f2e987c718ac9949c29c7a66a4fe54f3d90464a4b4edb95f6851fc3afe1f7a6f3d2abd37b045cc13ac14b61b0708db04b14205a257a9e1190b12ae3456640e6eacc2e7190b85cdc2de14a2a25afb322b336657dc88ec9de91dd9f939cb3375723372df7b0544f9a2d3d33cd7c5ac1b43699b3ac44d63edd6ffadae93df228f97605a298ac68cad38707f62b4a07e54fca27f981f955f91f6724cd3850a05b202db832d369e69299cf0bc30b7f9985cf12cc6a996d397bc1ec27733873b6cc45e6a6cf6d99673daf785ee7fc88f93b17d016642ff8adc8b56855d1bb85c90b9b8bcd8ae71777fc14f1535d895689bce4ce22ff459b16e38b258b5b97782c59bfe45ba9b0f452996b5979d997a582a5977e76fbb9e2e7fe6519cb5a977b2ddfb882bc42bae2f6caa0953b57e9ae2a5cd5b17aecea8635ec35a56bdead9dbaf662f9a8f24deb68eb94ebda2ba22b9ad6dbac5fb1fe4ba5b8f2565548d5de6ad3ea25d51f3608375cdf18bcb17e93d9a6b24d9f374b36dfdd12b1a5a1c6aea67c2b796bfed667db92b69dffc5e797daed26dbcbb67fdd21ddd1be336ee7995aefdada5da6bb96d7a175cabaaedd93765fdb13baa7a9dea57ecb5ed6deb27d609f72df9fbfa6fd7a7b7fd4fe96033e07ea0fda1eac3ec43c54da8034cc6ce8691437b637a534b51d1e73b8a5d9bff9d0911147761cb53c5a75cce0d8f2e3b4e3c5c7fb4f149ee83d293bd97d2af35447cbd49607a7279cbe7966fc99d6b351672f9c0b3f77fa3ce7fc890b01178e5ef4bb78f892cfa5c6cb5e971bae785e39f49be76f875abd5a1bae7a5f6dbae67badb96d74dbf1eb41d74fdd08bd71ee26efe6e55be36eb5dd4ebc7df7cea43bed7785775fdccbb9f7fa7efefdbe07f31f921e963ed27954fed8f471cdef8ebfef6df76a3ff624f4c995a7f14f1f74083a5efea1f8e34b67f133c6b3f2e716cf6b5fb8bf38da15de75edcf897f76be94bdeceb2ef94bf7afea570eaf0efe1dfcf7959e093d9dafe5affbdf2c7d6bfc76c7bb51ef5a7a637b1fbfcf7ddff7a1f4a3f1c79d9f7c3e9dff9cfcf979df8c2f942f155f1dbf367f8bfaf6b03fb7bf5fc697f35567010cf668063c37bcd90100230500e635787e98a8bee7a92410f5dd146264a011f43fb0fa2e484cc03304a8872fe2b8ce3d09c03ed8ec82e1950436e2a89e100c500f8fa10619e2516478b8ab004297c3a3c9c7fefeb76600509a01f82aefefefdbd0dfff159e63b07b009c9caebe5f12d26478afd8ec4aa0eb160788d77f3dff018fa27fe40a656e6473747265616d0a656e646f626a0a33372030206f626a0a333138330a656e646f626a0a32352030206f626a0a5b202f494343426173656420333620302052205d0a656e646f626a0a33392030206f626a0a3c3c202f4c656e67746820343020302052202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a78018d9dcb8e2547929ef7f51467d9bd98ecb85fb66a49800408d0a80968a1d18253a81629b0c86956f5087a5abd8abeefb788ccb89c9aca1e4864fe74b3b03037b79bbbc7f9dbe31f1f7f7b74c3a379ccebf018d7f1f1fba7c77f7ffcfaf8d39fbfb48f8f5f1ecdcbeaffa6e9d1f27f5f3e3ad8619f1f4bbbbc4cd3dce5cf5f3ebcfed93c7e298ebf3c7e7afc15cefe1f847f83d73c8ffdda4c05f2d730f7ebf4e8d6e631ccebe3e3e7c7bffbe1b11445fde3c30f9f1f7ffae1079ffdc35f1f7ff88f3ffffee5ebe32f5f3ffdcb1f1f3ffcefc77ff801f9fff45f3ffdfef1d3bf7cfdfb8fbf3c7eff99c78ccd4b33744d97a78c03ec9797ae6ffa473b0c1f78c69ffed3e7f6f1ef7fcbab9fc60ecba31fd6976eee791e7fd4d86e1fcb7f6a86b65dc2d7b1ebf4d2b71d9a19968defebd82bdf61e85efab15586eff21d96f9a55fd6c870e6db3ffecf6378fc97c79ffedba75f7efcfaf3bf7efaf36fbffcf6fbcf9f3f7dfdfde78fbe7c66edcf7f29fd3efef2e79bd2ffc139d8b53ebdb453d73ebaa67d59da35ba51f79f1f7da7f27ec93f99875ff823fff8298c3f3ffe12dd7d6b3adb7978f47da3e84c675fb3bdfde3349dffe3f1871f7efaf4f8f8d38f3ffffec7c73fa0d93f7cfef1d7c76f7f7d7c050612f9f4cba77ffdf1d7af8f8fbf7dfefcf3d7af9f3e3dfef8e17f3e7ef8cf35f9df362aa5e8d67933aa6f48f141a3fac2233e7efdf2f8f1f1e5effffce5d3d75d80b727fed31f3ebdfcaf97c79bcd7de7b153ffae97ffe74f1f7ffcfb974f3eefe36fbffebf9f3fe6d13ffffaf5d3feee5fbefed31fdff7bafdb83c5aecab949e15ddd4326c1eaf4af77551fa9f7ffaf4f9e72f5f779dffdf3f3ede14ca7aef8665193184977ec20c279cc34b3f3453b7ac2ee3b1e95e9ab1ef3eb4e3f432f26fd8cb180b1abb87d8d0e31200463d4a3b8e2fcbd2ad41fad9052032b0c2bec58a85d221bfe3c6762d5e133c408697b9631d8f4df3b2ac88d38efdcbb8ceaca8c7b0ae2f6b3fcf88d5bd0c987846f5acd7d0b55333d6980961e4d44dfc27e99697a11be7f06a867e0eb22cfd184e53dff7a19bc781850eefae9b30aa1ad5b4d2a18f7591fbf2d2d6125f5fe686f53bac33e22d7242605e6893739a1ba5ea5fdaa19d1835beac438b54381854b484ae9d9dd0b17dc163969c334eac846a16fedb80f741cddba050c51d85686c564ca1c6749d63540aaaf3612d4eae58f7c3f441645e6727a67f699aaee84624594ac8a9c5453b6ae0ffcba8aeeb7cddf1656ac35b654eed079fc7dc36a11b7cf3ae9065514dc34b8f9e82accb36a69d516fc939f3b2e13eb72d42f12ec3ece3c6970ed541c6fb77bd8223c9dc761bd9c2a3c12634ce0439074cac7461b0c2096433a74975d5d48dd12e0ed0b7cc98b6d1e698b0765248c2c0382bd0fc32ac0a0927fcffdaab4c26ba5fca0ec72196c97075a165b212b5d5f9659de689c789b58be1074c061f44d635cb25cf9b18d322f7eadbf13c639574603306193aff45ba0e4bcb2a5b31a73c6ee886ac4594a3618a4d0beb262a98589f325a5bd6b18cda7e63b4b64448c734e3a4321d35b2cac30b53ac25dbae51142a1f99f37ded872e6b5fbaf2076fd88e845346edc8db988fe40651a82e5aebe4ff0d7892287e600634fd159982f4630fb3ee6524943f21734a999b13ab6f23e194c79510acff097711cdf34f6520b19917cd0a9b1bc82044665c4290a523e711910c664c18646556274efb9857d637a004c00a63552c9019bfaa0018af0f1b08d06bfe1cca387080631cd299264fbf4032812f0216dfb0393e08a29a0395ddb338490574e5582b4b374f6f167c6b69726ce1848398e22157c64c5a74875ea6ddaf753d499c18465e5e7321972964c1c3c8e9ed61f11747e0f2dfaf7feeb335ae9b74634738a9e9222c68b8036b957953cf6b44316060dd0273b7d44b25a46d5ea08ba5316ac9a2674e2b68e1bdc815253b3f6d233b49701f75437855558d939a134558a16357a63611c99c6a2015c4021d630c048c11ff27d1da90bdb81e9a8ef8a6087abb60466bfc96c8340eae67f810aa6acce9611bdd118b9b3d8b7417f2d54af6508a2358b795baf671bee8af5975b5c43db37b2742f72630ae114b15bfc53f831d6326dc4c06310dca8eb90f8a8e51f0b0cc671ea6e8856550b0f7208aae5b1bfac4e001b638944a57e66550ed3a36d4a5d5ebe022d56a4da317edc9d58374a4349b671de28a58528a2af33eb903c0cabfec4f0b599e568e5509deb0db28224249f936e655ed4d22c068e4d89667338fead8f08b802a62a8f0c2a0b1d76c51d6916cd3df11ba8db90108002773b05ac1aac7c546b6b06ca91711d7e79351600848448eb1c4f6ce543e3e0833aa0fafdce1c8f7fa9c7a7996c6b0459f7e25f2fb74d6479b954dced42c7d2c78ecf036ea83a9305e5ce9caf2cfbc6ea3c2e93ca6a4584844ac07151d256d524c6b6c98f46ccdfb2ce4778352246a29d7954e29aed83b90b80ee3e73846c7bcf782e59511affa6cdf9c84cc788d7fae6c0f5dac8de678a183db0d7b17a22e98391e6e0abfe0f6792ca16aecf0452e8576e95fbad51488510d49f983797238c98d88597abb98ce265812ed5fa601d72caf09a7f161ec909e4e0308beafc3093aa69d598c2273839e919e51e5b1c01aab0380a5359f16305716213210f90ad9c9a669601442a12747752c12a4230334ed653183901df1b8799625fd0830d6258bf383d84a3551749dc90174046594cc18fc5f80c124503282e8cc94b433ee5b8b77506f7d261979cdcafb3a46bf07b22c78ff8d2e33286642ec28a6b24611fac9e640d066c8b07ca4fc4099c44be9cf646e0521c26420253ae81a7cb10853567a22198c9860e42ef062548f930b27e28e2ac79099bde2d45a3381a0f0a498884034ada9a299b049692dc06c12cf5466cbe33a2781f4307578b0c67a32f63311281c9519c706c859f3f7d2b98eb0a6614cb69e317a4fa0a56fc89e99272a36df8d41ba661126c9c733f54b4a8accaf91b04422ec86113e03843c8122a84caeb14a052179c90cf002fd06619fca346057a6ef0b1e77c4e36960cc826a83510fc21480610d0a45a86355846e61218090cdcd382d392d94be19b3f63070c6891c145660306826ed82589eae12cfeb48015c3e63c22aaca9628b68c91283a899ac446043fcaf65d8b4d49ea1a21a6502c8edd057e8788395de8ed8483cc9eacdda819c6515a0a36408d18c37f561ac7a0a19a16e8efee1c24b6716679670461cfdc24e75c2eea3762436a23f81aebc0c894e4df8daa078bd0cf275e4990a31d084cb33bba5de97b2ce57c1c94096f70d59897e66b58f0aa38cba232504c510456ab85175c4e162accde2424788a6776d80e08c4b9f5d67c904225dc6844e29aebc76e46dd41d2929ccaccca0599f584e49a1a9b6947c621a91cac9a217a1f1e9845ce9ca66cebcf651c549ee3bf2f6bc9282d7b58dc26b2fba6ce7831c7f7bcb455bd5fce9d5b8dc1984af09d2a75805591b1c8f326042d346479ba9e8a83fcbe0e83a398fe7a719b12ed03b805d6e7204bd22ce90c01dcfb1f42c854481b1ad3726b7c0ba19834babe71fa9eaf1474471fc9b9810befbdffb7376fb992d821cd3e021d519f335d92d069a9854e71c87cddfb4131aa2a9c089c8675fa0ef033c1e4e14064c0c73067dc7c37c7eda09ae5b30cab72044becdd98f38a61b5db47fe5751b75a7db56328a4ae4d0912559c0764d27f56c962b511dc95f90c14c2ac82bcd66336f4cf6ff8e9dc973ffb338ea4ff51fc6d5f80f6ba17a75b3fbbc68438aea9b1bc00cfee8a2c5834663272a757f61f47da074cf4b8ea61a064c5a76d13d2ebc4f30e27944059893dba47b662ed525ae5fe8a2fb0b16ba3377399d91d2825db2e465b42cc765dd72b566b00035e7a2b90b379c669a982038d8cd99345b2477aed403fe85351d32485516f9251dbf205ddb54d2777a5ce82e22e471a751e17442b629243c55a4362fa1aeaa10d04df1b54c267916dc48058744262cb41fc95e40ce74b57acfd87dd40d41f51a927e556b75e14cdb34b2ff6304d0a5937b3b26b99f763490a65d89cc0cce6cbef7773d1a47995c18df304fa4072a80d037b4b8d8b8149f6d1832eb6110994a2167b27aff3326dd0989de4ec8360bb650b36a300efb220a417f9fe23c338fbfae8ca1993764201b82db954e29aed83b906d1678cbc9a489d7eedd2d540aeb8fe4ee24be6d7270105beec6c079a241e49836499aea224dcc7212b3ababc612f060de38c7000baf01d9f571a5c2930851d809794a870951912dd551b29394968ff5576b056267811c9f3494e21fabc20bd28d5df16cd0656f4d8496718f33ab12de9dd8c25a7adc8e6a66734e464d3c2b8de5be4dc38056961560d191abf38e13c31b7d8f12a4b78d5003658302e022c8a6463a0723392b660b737a69309f48727a42a42fc32608f6c628f710c36860872463fa8e374059f0626b0631a1736ee044029a847622716fe9c215222710d37dc94820669b9e93191e2f45e39874cbe50dc2ee246b0ba4a3f9fe4184b4bd9aebb8a2c5fc198c049132083e1ac2c4ca5c22367dd005d7d64e342ae67ec8d3d861253b81931b16ec79d0f9c65f1a7826fe53c37b8f4dbaf54a34b15e68442825d52e457b46a114659a79cc3cc189ed185580b3416e05a031cca6f8f638aa7602edc4b47496750ca2aaf3e5e018956091a3ad248650e7b119cb20f49cce0e18a62c6f9e66eee028f6af48b35a225a83076e67ff657b3b3b42d69a13490d6187b2ce3a4bed326aed48e644b060041049ea9dc7ade662406469bc5cebf4f82e3336c0c3832c58184e0827d264178622a3ea9b60ecbe30ca894a3d6acd665edc12a45256cdd43b7dc51531b25a78a160b771a49b59bd3c0f9fe92e95c8c06b81b8518115a396605a1d18292d93d7c200bd16a7c1600a322473660c0dd5981818eec1576666b2cc40b00c9507d2b9a1d252e63766d73884d5be06cf33597053d3b089d791bb0b209925734d172e63d8c353c16e4490244b47c93fe5fde035a50024f38a91cd9450e855d6289ff94400dabd156ef1063649c4d030cb05a132065b75373179c8c4faa3c540c25873ce610c6d5b880d280339ac49fd0a498dc810bab132768db87c52efa370671817b24dddd418e298f234b9a8c26dec38841546df2c530066dfb49d29046603213252e5ab38eb7d6a4a1136c0a4730ce6e8d4e1e0d85d064304a62c0891b42c93c0b24d267e319c566dbca61c435674cdd6b083f1a0602605eee183334d9ec80853fc22a2a1e792c6abd1cfe16d693a9991d5cb6d66b9ea8830f971868f642447d6c2ae3154aafe31c2d64008c232566a9c144b8855af4e31f0a2c3f921a3fe229be070e2b84b3152212c22774e25a26d5132e2e8dd4029d626a22c680a4844c235d15cf4f1acc2f29f18046dc03c0c3d642ef51fb63d1d456a21272c7e1889c33c8f97556c04ea69ea28245631c4ab6353a6538ec20d4b670fdbce1863e62e2e95656cc7053a5cd162c7c65136ebe32c489c01508e9288901af8ba902db47924433d4d30d63a7d098201c54fbd0cae81159531e5ac300936a437321a9a4a0eb6b0c12123b66894d2d0cf734574d84c818dbc0a3d488073611085079123ee9ab01eaa6934f1c781d24076086b7960721412a74a0d184e34e46a54921b43a6ed2419b195a54da03f0e3d858c9cde3cd4a7b5e5d4713ab5e1455a32af4c2611ab1f7568844c9298da45203039af06483c375648eca3450777f71b573b2a44316c097583ac2cbe4c01f363fba930f42b1da6821f60437a72e9089cd28d9a82269e973766677cb110407734a47c1d963433ceebe1867c151c14b8034e44fba4b0fbc8204e68a83a0a6ac6e11b8a1187276485323dd5202b62874225e6c91c3b5e2b6488911314af167f1b4ebd9a72948129c8e979bc0cc63a9bc268d26d4774e765c0e85d2a17663ef52e739ab6c9eab44de6fd09ddc62ba7660cd42d7323af382fa5d7c14d242f2e185a63e14e925d0b8644c5f9dbe8e485e5e15bf1233876d28ef06232d3372104b1d1252f46ade900d0c81bf043773a7999b86421b3e63cbaa05ccc535298f47749f48c945d660cc32ab1ae64c5aa0e7be801597a1b2bd68d2b0023e59419bc302cce7f0519920f829ce9e48549748ec2753773a5b26286bf2da2d83fbe204fe89ef1ba712f4ea7e75561643bdb38902669d54586e7c406b0b4ba13b00f4822e6890c191c74e4f47d00014af169f663899e4b7172ac86f5f3e64d1cb400613d79f823a1afd3393a5f473243ef05fa3e100d98b3242f4fce822b63198ae5908b183312099e20273ae7e1c2ab389d46ddc6e00a2c6c083b6c9660336efa61ade8018c1462c3a664fe17e4091d52dc78dd10dcc3f579250536dfbb2e70af94dfe913e83a67c33058360475a643ef82c24de29e75cb573aa5b862ef4070cbea0217e1f106f993b466c18a19cc82717ca546dd91235d9cfc95d79dfb1d29292897a844322364179e2349099522c30cc27cd39aea061ca9b6c076e614b2d3a83bb25b05a94785b689b6fc6615c4165d2a05ca3491be12222aa1c476d6dee491d93dd395559cb1dba858c5794ca4c089cfabfd2a52436aaa72ec96973605c1fa6cebe052c931f45de472d40efafe33990be48abd0329a3200611c12a4a504b95a330baea67ade292c40ae8160837149d3cef42a5495cb17721a50842705ca81919e5a22621376b9864696c566ddc6c81338a0db3424e741a0574270c7d5d90fb98cd55d8634c0e44f0a2de8b51508a13bfb3481b762e99ca0b52b67aa2d328aebc6e48389d9fb72f0f920fdf9b4cdf805ecb8386d5e63e3cf025b74a61c903706d6176262b21ce9864df41364f415eea01257d13255ec2177e87b33c25586be14612c74e3146813b21f0073851c54f60b46e4125cde2445a5ec792488b26f5a28b63bbc00ad440685e97ca1ce627baa7bc14e1342a329c9152aadda918397b84d61c2ad522c5234ca463349255ea53e44817af73e515bad3a83b5252501bcc490a11dba69752a0e0546cd41de4634ca4095d0a183c81878145ce644eed15bb21e174a5ab4e1f13c684781495f98b109638362fc8e249f59c5b2bc29cc4a41f4ad0801be29ce894e28abd032903235b6da863513e47183049a5709dee25265989eed67e444cceb68771e14aa7595cb17721e5778c32a9cde921b41c5a560a30bb8829bd27fb64cf91235dfcce9557e84ea3ee484981fd79264b978fa3ab30402a4e61138c0d2193df0b825c573a7571c56e48389d9f575290738cf668c95887ae963c49325d352523eee51cd91581db954e29aed83b90cd2e3c5798fc93906897d219112b55b09d6f8efa143850c52aae9c8aec306a6374444a13e468a9cea991e8902541a122e29488a19a1cba4f75f51439d2c52aaebcaca44edc91e28aec52b0e1682240d5b3af109c45b52bc914499fd1fe0509b7339df3613d77e47543c2e93ca6a4704d66eb06576dcba0d669cf762c92d1ac4d3f81957b42e076a5538a2bf60ea4ac82b46bb04147486cb74d6a21dc6c308e19546ef60439906915574edf07f6c531651f31d3dff77114f43226cea6c424dcc1d4c89f218ab0d1c5241c75c0b2844ec8c6e930063a5cb7495e3a16f6b8b6154afce7ac030f70c3180f66054edbca8e851d3fd219c93830a0aff51800f9bf730196f34bc10c7e32df8beb999a1f4e97c715594f6cc8d44fc4d19883dd926c4de144fb34542f48589de99ef1f281e75137643307636626d6b310d8354669532f7d655e889d335b43cf90135d0ce2caab22f291fb1da9d9a026cd7514dc76430c8b4de074bcc990e0418e835aa921ecd998bdb3680c61c45dce57640ce952ed14b8cde36936ebe2b9cc8baeb40788d25d1f70c2b22247d22390841ba4e5ada7760867ef6a07c7766142399180335cc97448aa72a69090cf5ab16de76ab66fe9b9620e6b835ce83412c22f9d571e882921e8de91ab9331e8b935277554cd9ab541e6ff4a1783a3e5a0e140860b0b2be2f6523b59397aa2b2282ae36c30668a9f005c6a71e53399e668da8ded0897016b8a5669150b6016f940b9fe954137e048f594d38df7fd69d09944d9f1ca961fc5784bdfa42c109daa2d30721b5226461d9127746af9caeb8614a7d3f3767fd078a8c1f9e168c6b2adc63637842ab1d22b59531be4d0a11695d578a6abb9ce4ea5d273e4bf327eaf0fa5d569a69f06306927cd52785982654b983e9a3b9caf74ce10e1df1d92da638a54f8a2c1cc174bcd352dc7b012443c006a63f542251f32ed5c0360ed708fe0351998d3ddd3c9d4026be99dc28886bf65d84ec6becc46262b23478a7bcf04b293661cc3cadc43f66550ae991e25d7d6a0251d2c83948c8efb46a6a6e0ca4e6e92e56cae39f738dd9ca673639c7d3910b679d209b597c3427ca5e36cb99d67b60814cb16a5fa4454eea3550b152c9ba962368832ea8e4097570cdd335e77ee77a4ac99f646430fd91ed9b89457c71fd002670ec138848b2e9e23d0654ce8d4ce95d78ebc8dba2391c21364fa396d64f634357a15cb154e30a21b35e68664d41b72a2438a1baf1d41631bf71d797b5ead29ea9dcec204ed6b1cda0950b34dd2d47b9e6143a2fe37e448e67c5c387d17a8e046bb971d25170fcedaf32aaac14dbf348ae069bbea1bc891cee076e3f51ea4d4401f9fe08414cc00c71d13dcc46c4f827126cde5f11c39d0c5c8afbc8aee38ea8e94142c4c0f3dc47571b422b3e12d8e3825dc1997bdf4d94700a9ae544ec615fb36c23280b34f2b190c8cd9e2d304b75d0e3183ba4ed673253ad967c8ca652fc748a714575eef4176b36c58a064791c062eaba454ef921f903579c0c1c58d91383fec8b7aca5c8bcbcec1465546794050de79c4f5ef7ab65d1a8c4ebe9ccb29df690261df422c7bb10544c457e044e5d3af9cde81d4aac0d278477db5592d91c475691154692de7de5d96362db2f74a4cc93abd506d09dfb6ef879ff52e829cd86259b277b6f5b80cc1f8942dacf1241c9b4729927d175d78110573add6a0c98e27ace8b0cd9c754250a0d5a0f21c39903de314aac398627304323594335cb5301e136eb8089d6c0f2cb786c170eb55193d418e741ae78dd70db98fa925629b26a76f88155ca1ae7c1c6cf4c48abd730e03a6977300e075a552862bf66d24d12a4f2b4db89f995cd513ac95be0079df3dc13b2b84a978824006b32253860ba7ef03b54a483fc8cae33d38e0573bab60eeb3e8515a0fa96ab34f10b379c784ce7572e5b5236fa3ee48a420f0b10c303fa207571e2a7a80716c89a509e6b6aea14fa446bd22273aa4b8f1da91e224f71d797b5e4d868d01bb57b48f5920351b609e8a14a3ced42c0b21213a22273aa7e3caebdb4838e579fb8cb0028d61844faf0397cf20ba962f6343b8bce63384132eaf743523675eeaff7b48e98295c9ffb00b92688f72eb24c472dac4fe75bccb73242deb8d4e5d5c79ed0876b18dba23bb2e784e1552f46cca87db58e2841c86c7452fc34580d8d81b70a22a4d9c3985ec388aa802a323b24552d371549ebc9cc5e07400a550e09f751cee0cc0ea42a40417e8fb002a88503cc3cc4eaf8d5f2c73e00e94e600a6fb50f427c8914e77eda823f62e649f084e7f19a4d98ff6724649b1269d10f37c8dfc9f2047baa4138c3a6279c713529c8e63368f4d3a544743c8482c0e354a6a981c91713b87f361b86c8ab51cc1626f827a9c215732552166114ac2cc5719f669e5f0a95e8812df1bd7d664042f3d0ed193f38a4fe88ad764aa242fceaf6b92704f572adcc3e9fabc8f7cbbc943da7cc5438f43d64c27df17ea281f352e7a1cd9451020e170102ebee70503b82ad206a1bc4086a79c2872eb062bb195e60af7053d3258bcc79e53b5f47a70ec562f1c96e63b15b945d49bb6dbd5e17b04c926a4636791d9f70a39b5753871fea1c6701173d2bae08517933b9da51e814738717248c9b51adbcf20b31a8635979a534c0a65279fca98e0fe81c289a7858aa373049f9e5c3e1e9859f1f2663daa7a30f0e173113e0a227b09346970d89ee595efea8535eeec8f7ede033ab0ed2e778e92d4200e4ae6db306be3491286e0e47833be16c319d2ba5785ab21470d2baf1c864f4a6e9e161fedcb73288097878c13b54586ba3d9d2bc6a971646254be81b3215ea9608e38d456741cfdcddb51ebe5bc1a7434078d578cd2d749477c449120d418c59b82d2ef1688718ac009e03539190b42632f1518082926962942d3d78bd45868990e9bb21ede136351d50d83ed4b1bae6c4c216439fec94c9273d62470fa244d5c302ec56a15ec32f03670f22c9cdbce20f83911aa29aef0e7f508074611202e49aa1516d7e02159ec999e8a72f32fbb5972a418325899f3ab038c906b299a33de4ff542c6394ce60e80030f0e61a578a05ba5b0b21626562c7bc222b452fcb4888ce4c32ac4a915676f5f1419af590b037265326935e361adb6e6f22a8535e0cbb96dce7944e9c07abb338ae0b90411dade2500d7f78ad379d5d7f34e58def78444823312d7ac9d7b48398b8c8f53e843c03812ecf2b40d62b9a9e59bbe882c71d6373aa4b86137249ccecf8b14a89e33dfb5f8e15f191c2ae0fb3d3c131f9b03e88c6aa95e82b0d891eb46a72eaebcde81a07b1a9cae935e7f8dbd534a963f65a5d487b168a6e5d63e3342834aeda81403d7956e5b4d675eb751773a2c47295cb61653bcf7c01e98c1d295cf4e7930ae08972f60e102b865889654756b562592af2da90a3c4fee0c386dc496a89fd69eaf28737790ae8f8bf95e44b88f42f5d731bb0a49af1494b5ef291a85a7459ef376601ebc0d4267b5645db8ac02374ed2e658376338139a93bfaa358584bc0800a1ebf82c40b8f3bdbe726da7e76daa3f6125c149aac87442223db1a2be5680a32488a4b214cb39718d820584a6d9f2f1368006c099ec005cb429bba1d59673c40cc2c5a308594d2d6e1164e62b074196ecb1cb3a1f47d81ea7ea6fd80d09a72b5d592f72968d4c7e3167533d2deb4c37feba6cb5e57f4158e36429a8b9f3725c4cc236ae8643ff96bb588579295e846f68141dc7dc759704afe3f336d59fb0fba827c86e38b8facd1db3571cabc728b2d98837246e95e1e422aace97afdf6d52b0478ba4b8638f3a96f44b0e6e89d164475282ba6f8803a99bb4c87e7cda4675c6f286c751e1741e53b26bbc494248d2dd9f55f3a45db9a9810c249b153bd7d12db62c3d626e19fd914ed9afbcde816cde8b05c9b656ec8b664c49e1bea007eab1300e852b05a3b2074aee91af7d0439d2651eafbc6ea38ad3910e1d6a859e40a824824b7375af988899db10660d7ea82f83d8de471549166f54998e33a37d4cb22839ef409804a8254cd2e84cb3b408f24c047e91469ebe8603fd7ea8300885069cdc2452298c3910b90a4fc0bffd278fcd548e9596f0b2f6146af17539cc87d9d1a72a63cdf71bdc30a92f6a6025273233952bf61e24efee368441822f9452cb247000b120714d0b4ed80b2896333942c0772f48d70430dac9e63f0815e2bea19a339062c4656f8658265bc2f1998bba5a6753c73d57ee7ab35fb65fbaa0fac1dc18c4a126dc8dc5935b854192ae81b01cfc42028c38aaee5c83cdbd3b65607c7b0b779353693a2ebe4f40ad81ee4048887c1eb1ccbd2fe93c21cde5f5dcfde2f454103ed356747c96324072508770b8ab1e4789e79749b6eba8a514b680541326c15165de1791ac9abc3a8ce9ec52721525985b233e9e5dc7023aee6505a9f0ca45d77cf581f98413155d3d6d70172eba4c00913947f48210de551c21a5c749f872388e4c0bc506e46e2071c5ce8f5e70f0240021dcad74013ed7f046640209c693d5082bc14d365fad9e457e108b20d2f604261fc57f9adc9d67ccec495700f67c9407f5e77a1a6c28d0d51008f7102221e27b9b578c7b6a6a8dd098cd5f26b27546ebf16ec48a78bfaf1e67d31264b09cf3c834b7cc14113e9eaac8216acae71809eba35ecda2ab18cdac563f89c596a432320d4981e04304502198a4a58ccf8237a7e9e06446cdec49477f36647ce6b11ec6f6522d002e0dd402506b662830a776d29265e496082b69e464415eb6be9fe6178131f67a335a5b5a441dde5191dc6ef66511d2e5224245a1d818345fbbcb6d5ef56ff927276f6fa8363f649887793f28339218c3108ae95a6e302f22e450d7ac0c2e8bf1ae94111ea413397a844dc413741b73052aba64662df57991d97a18070777b6d64b49aa56a9f9b0450dcaf5c632880359ac4d233960a1fb1e520e0ecbf7069686c215bd9c3ee1999cd2569fd8ae8ae2ef1c1bd650f31513901355b470c1329be751723a232503ad0e8fef6a50f94a8a8a00f3be931857746cfcf32f5ea48dfd980766cc894e73b9');
SELECT pg_catalog.lowrite(0, '\xf2ba2170ba8e79d5444e29b088701c8974ca9b6f658a79b5326f90c4148424b45e32970e11d40313ca0095df0956f6f26a02e6a910b187a7e820a787e9d5aed87b90129d9040f80d7fbe0399dd1b5c6489c5ee7f2e67e25a9b1cfb422a2abd2d921cc822fa85935a3fb246f20bb00bc099ffb2186e4b96ee7879ce072294fd793e57a973e73e84730ae237d56576a6537b57ec86c0e93aa6a448e710f62c62e3b066445b8befcc06236352f3c6ba1816a388ac30bb9029c305fa3e800070b29e71b70f1573c1b2563445647dc6c38e220e281f1e2469ca20bf0e7627d318aeacde83ec5aa8bb8d6899891f620dde46c59fa9793c8d9a6729b310827053c26d14ceeae74ee4461773b86051d679d4333a9256d61827d10c6426479b45109d387709e60652546fc04c2425945448bed2d59a3ef3ba7147ae3b9d52e0d44c757c22db35b569e2dc261090d3712a8c51b8744d84c3c934cbf28ea4f81561584395e0c43d162753f4b0f6aaa564046123fcf5614ee3157b0f52d388abf0031a49e0ec189553a462dc9c62fa37796d6b35dd11d7e490e2429769bc6051d789fb53ba9a468cb6e2d1b6dda39de41a302f8e5c5b229bcfb36af6344ac2ec445693788214f42940ac65a5246750009a7ce973f28266fe6a81b8cf6988bc732e1b8b70b944f7e351a724c945966c473205b870fa3eb02f27363ccd113d7f412eaf04f8907c9984c485cf349635705876cb1c38b4c6183c4fbe06b0d3955b39f3ba8fba232505b9737d92c89305741d948295454b37291ed201b00672471135f04562135c2624173240b8295a79187ac897517193b99ea4223802c71113d557d7bfaf8f53f82bf66d246a8f9811de0f02790fda0b3ef3b64b440381ac0c53b692cbe934dab9c97c00e8bfe3a200e827d916368c5200220418e5108b951e0085268b97dee4b6198377c96d0f1ec75dbc1a83e924d3f52b37e488693157a788518462668cca91c9b4f1c55aadcfee13a738109be75907a4478374b9f5cf28ce6f700d9f972198597a1bcd527ad368e878b072929099097b488f8fb7cb9df22556cb2e75be64e0185a557ec619c40f6841c7097bf24dd61b18db094c2174ec63a028ae3469c9027c82af0012da546d922d9e11a2a450299e8ab447ee49772fa40461bf019fe6d90aafc0f8b034c2711e9cf0e0e893a350effe091afa8b9ea6247de62a65c6d0edcfcbb199c617fd519d7426e00c822f13ecf1114a8230e22eb802d83ab6d88315994376bf3c2381e70d9db3c2289eeb3d4dc7702c2c009ffa7c7d9a727b36193dbaa549c39277258df13703e81e5110e4659911bf69e4ab91e251b51699db1c8ee238242fc25e626da271cc8733c1d8041bd7eef848666cb090e2781079b822b2b1495b2c64e4a60ae03696eec7e36b6eb7484799449c61ab9fa4c2e39a22fc240b02b051c9291a04f0e08f9b3aec40e6f8356414e0554832888362a697ec5a91e5322ad92e3d4e8eb2508ac9c8a6c05613615475031c4de6b3318c6a52ee7bdacf0b51f2a6772527c31a5f76f47939b8a1e85ab3bd4b1096835251dff8beac727e13c22128d386b26494ae7ca81df78aa5f3391e8482677e2d80e29ac34c980074f415994ac730cda16369e79319781aaab97a3dcef8eba819c5576ae0e473938e61ba1e81dbd452a51aaba86ed461cff9dc3762f295029fe7c65d726cfa4a9cd7cdebb166b4bec8be3f0f97515235f88c9a17bbaf8e2125aaa28fe4c06f1255ab80438ace7a6d483031149b9a38cbb70e81b81758fb741c432381c45a94cadad0836316e4ea970b0522bc417d3ec804643ba46f4342d19d05afc26976dc56547096889be0d26d276bf486d5836514474a59e5585026cd517c94cdc96209f8cdb01870b6f74072d413757ac820dd925859b82b279fc8930e0f8b972909948937778b483a1ecd362e585a8ab53af10ada14cfb362760c56e2e791285ed889089db66842c5bae2d4ad6f03a7f807d71efdca20ec52e83138c7ef8746ea791450ae6c4ccf344737c63503de8fc55f17a7f534b69ba56315159d2ecac60274f403a4638eb084ac6c9c9ecf63a5ed178fb32de6f3507f760fa4ab7bc01e20d2fbe63ca6d3478bbebe4d637f8bef6749e635fb783f16417d7b18fafaea8a9dca4c286f50576c08b6b5870c195b08be0bd1accb6765ed881a5bbc38ea0f58c89aaf91a839d67a456bc95e3fef35eaa3091bd8961e5946ccb971c40451efeb4d6f64244624c433848d5434c298c69b1d71ff7e374e0427eeb3f0799e4696cc7e2edf151463638ef925dab151aebeb1a76cc7f399396e833a73b83a02eef638ae4ce9365db01ee324baf2531e05309a162c798b6d985c47f646a88fc30ce3b75184478e13f1b3336cb7d52a85e08e77e261864367863022269551d3302f6bb24e1e96f442f58b9c128e7ab74494042d0f87f9795457622cd55d0c132644e2c88a82b30edcb0552767bae235798f405e54b6d5922704d025094689a75c1437e944a3bb5c892c9d27bce156480b369d278d9017dec0cd7e94584687121384448ecf930ed3a4ea7046bdc24bd02723d4ca6d2489f187e765ccb8f4ef591beaf846272fe2025e9851a89909909569598e2663931ca64926c07c576c242131a45ec8e0a45b46777808d6f576c298d864d3282186d8062737c8e3b6e81b22d913328522703a13f81a6c61170a0f08a4861aaf9659d8c4e1625e260e37aa62547b89f836366cb29100215ac78a64458918567ce2dee761957a40599de9e4852b64f1320a13e54c4854650cd4ff8051e9131e0dfe47e409dd335e37eee1747e5e5503e6049e7c20fcb29551c7aec0ea83d876554d41cc1c8ec8964b1ce99022f9c5117b07821ba43423da4df58d32539caa8c8c232430e8420f92935749494592baeb8b2f7471aa17ec3eea0952ba2083c9ea47fb2cebbaa806e6f79d9d11bc2b566f9e73478e74ae29471db1243a27e43e063a74a197f01bf3fa0df2a03ae700c6cffd15469696957d429ed021c58dd70d294ea7e795144c44fd1e82911705b090e38973fe8548e23e880e94854edcd1a972111a6e573aa5b862ef40ca2ea0e4334b7a683cb53f34505290ce63b160c46ffdaaa3eec8814ebbb8f17a0fb2cf0821547745e646e333bbdfe9b03a4b6e6bb06ed42c7dd82b72a4db7cf49957e84ea3ee484941f9e04d63ed82fc3c5e8c984a4c2ebbc01fba9b8e3869491929c84c91eb4aa72eaed80d81d3754ca4204ff4a7ed580f66acb86e1d3cff9a7a147fc767348d0cd68a661ff1939e63b8d121c50d7b07b2f90b92629b334619f6ef2b62911f11da8291bb9972d16648216166e85945c3cc892efee282dd473d414a179c5cf0b00601914c52ab2022922d6803e681da2608fd06731c37a698be8c79a3dae2ef81cf3e22c96b151aa7e76c5e2299386fcbca2345a82d6db154ca348abd6c82c90bc0e908582fec54b52ec8e90f5891fd9bc8b63ac9e82c92659fdb3db53ad992d422891d96ed5a33bb8eaa897f49d7e14296c579c120fb3e52cb82706dd8368763ab256b935224f762f44aa64dfa293e7d67f247aa632bd4773c92656962f0495d1884dfcd1759143efb42bc0ed9682d73ac4b978787a7d10cab0bdd535ef75177a48c8ac89f5d3a13673727352b3284fc8cac9815ea0dc998339d0beccaeb8684d395ce2044da91bb465491fbb702090426f7e9b0f021c80c62276bcb53a951e37d4e649ad785d3f701d40027b4cb0246cdb97e5ef66d6bc7a9f6c81a2bc9d32c56d44e8517edef443ebf18d11adb18edc81beb3b5233612de5de25251c6d97baa08021d1036245e178eae3adba1d0b594aaf5c7cd2c99ce99c892bb62370dab8efc8dbf34a0aaa8774304883f8b661a5896406e6ae14ef7eca3b69901da3c3df671a25b8f2f936124e79d62e01153053414b211be15a24fbe4fc6a4761f629be814007b78daea438f30add89fb1d89142697549b70a320b6d2420ab0ed633976982cce9f22d221e9468714375e3bf236ea8e942e6c495957a62d4378551769dea97f2cc0bdd91dc9a857e44ca72eaebc76249c72127b47de9e57baf02a60ba53383dab6575412fa13e1204c6cfdebd22703b20673a7571e5f56da438f9bcd2052bbb3e2ec35ad8aa46aae09c0ae6919ce1b1f2798648166692a9890ba7ef032500e906c76db31839b4bd4fc69a33f72cd0fc4b5478418a8e85c618e914e1ca6b47de46dd914861173fb703886fd4dac945c046ae7b221958becdb321703b20673aa4b8f1da91e224f71d294e22bb4970f8d66ad93c8394b04c826f175b2e83e57434932d82ee8fc889ae4ce2cc4b93788e14279f573362afc6fc87ee1c355b55da6e0f07e1ea848b83541e8f0b428bc82c85e2180f6e0b91ee933d2fa7032cf74d1ce48faca684cecfaeca9a623ac8f961358d7a637831ca6697ebd39eb3658b584e143e47ea0b381bdd335ee1741a75477635f031351323771ae89928052d00bf5a16cc4bc23b52a3de90235d69e2ccabe81ab3ba8dfb8ebc3dafa47003c1ee1efe77d147972eb68f88139008a04841519d9fc1b5856cae8472f830065115b2edb3de2966ddc5a608669b28d34ab79d12d069b41fea0cb943c8f1b298447e12c32238bf43eb188e8d576390306c766ed026b3a8cb049e88aa2a8f3bcfa6543876d22e823632706213e44a56aaa140c6191b7afd059c5dcdba463ba1c912b037be1daabadcc1b46a652ace74c58b6d4ededa3cdd9bdac5abae60d3f9b2e6b1b54dbe530e8704b76c977e9cd13f8ddfda1525d090dc4581f46113b189381c8dd8307a6068ab10b44519fb8a9ce810cb5127ecdb4871f27935fbc4031f881ed8da4de54c03386d539bcdd9c7baff7d24497174e19296f591ed0da887a3732f8ce060d91348264d0684d7c786c072433d569b5d2c4244fac8ced4812a7e0011f33d521bd2b8cba4f776a55ccfb639dd14b2a4e24a9f6517e6e2273294ea44272fec93a60e666670b237cd14c7b293db1023f3195176be6b466d3be6e7f8ae7491cb9d3bab38578dbfeb536b8b968c738c65fb8169dd2659894bc9dd32524903db892ebc4867f38b08ac67beda54f72fe9c46ea927572960452acf8117d5c712b45be84b9fc864459dc35e8abd11ff631dc12301e61433a29200d77d2ff49033659447b4a85c6e17b2ed0dd96d727d534db11cd24024f5d18f8254ee4b5174438e542e2c66f7c067ff1b6b0ddffdeffd39311f6a060e73a2375e838d854afec1fc95a560e9fa9c81141f672a1572e5f40ea48a5bfc9b4fce09303ab1fa0321ce1c16961fca798e1cc85c43574edf076a0dd1c961b5a3180326914313c37cf201f2604edd53e444b74de609cb649e90703a23910207c41d17ec8efe303bd47bdacd750516921822a61b7c4278e92b9d8ab86237249ccecf2b5d10c2cdefed2771e2aebc331835d3867952d9b07e4478cb2b9d0679c5de8194491037f8551c67843860407046c0122c85b63ce50e1ca9e256af9cc2e738aa389f90d244aa4c030e8b97ae67ac02ac80fac4c8fdcfa4e91b45ece1c285a71542942cbeafc8eb93a0b353cf9183fc52073bc0f4fff67294de633943fa1426158cc2a5659173b8cc64e74ae74c5cb16f2370da9e5752d0bdc96f5a92d2e1b66b26e88df853c7a679607ac83b527470dbe894e2caeb3d4849c1c224b4869be71b34077c2bbf495a46e9dd1e9975fb8f0c71b7d268556411743b16819bca994a8235b57ea289500e798071fb414ede12da02385de86ac01cc932b3f4aee858316b5e9f49abdaa664aec303e14c5c284f9103d9334ea13a8eb901a5145cb6072614c03b602a852486b33c81c8d7dc21bb2019732273622e9cbe0960b4f5ac0840cb8ea68802b813bbddf772371a630db6ff80e41d912e7962e810e1c6eb3d48a9c163065c1b4eb7de024b3db8a7ea4156c4e528489d2eb823d2654c2f9d8ab8f2da91b7517764b7d0be7ea981ee8f5f572813f5a75ff0a4af272ad2c839fc7da65102ccfac4e78630a7d73191009fcf3942e307dd0e9bb2482056bf930886c3b823b5bf78a2438a1baf7720e5b9adbef3f93f8a0e8ede450a30e299090558fd20e133e444a7efbef17a0f52b341a7c0cfa7193fc85b6b71da3dc8f7afdc9bce327f8a1ce96213575e7abb137766ed8a440a1c0bda7735b22874e5cc48fc0f254130f653924c71bdf70dc998339dbab8f2ba21e174a5338e98bb7b741a3ba4a3bdc7528f9a06f29ca2838e003676a5d236afd83b902d9e939ad65e96c7f7b6580696532ac8c5514ca3c853e44897887ee515bae3a8e27442f615c2f97ead227bdfa94accdeed740bf1fdde98fe13e440a64db03e4e9caec06d04444e85fdcb6ce9d13f76b75527912e15d38fa9ae346650fd057942e7645c79dd90e2747a5e9925570ca80bcb04fd3938cdd26d9bd40178c064111ef1b2cb45e9c7c5c5da073f939510f52919d447b7ab5e886a63ff6a34d781ab33c93785d5bb1f65f1540a9becf902cd4eb6b1e287913213ec2e193b1d953328d85d7e81e34a8739fcf5f18fff1f2dab46260a656e6473747265616d0a656e646f626a0a34302030206f626a0a31333532330a656e646f626a0a33382030206f626a0a3c3c202f54797065202f50616765202f506172656e74203320302052202f5265736f757263657320343120302052202f436f6e74656e747320333920302052202f4d65646961426f780a5b30203020383432203539355d203e3e0a656e646f626a0a34312030206f626a0a3c3c202f50726f63536574205b202f504446202f54657874202f496d61676542202f496d61676543202f496d61676549205d202f436f6c6f725370616365203c3c202f4373312037203020520a3e3e202f466f6e74203c3c202f545431203820302052203e3e202f584f626a656374203c3c202f496d3220313120302052202f496d31203920302052203e3e203e3e0a656e646f626a0a34332030206f626a0a3c3c202f4c656e67746820343420302052202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801959d4d931c4772a6effd2bf2489a699a55f9519935b7157764b632936c25c24c078d0e1c2cb8840c20860034b3faf7fb3caf6776574616889e9903bb5f847b467878f8577cf4afddbf74bf76fdd89dbaf93a76d375ea3ebee9feadfba5fbeefb4fe7eef5a7eef478f57f974b77e6ff9f5edbd866efbbe5bc3c5e2e739f5fdf3d3cfd7aeade15c777ddcfdd4f70f6ff10fe0aaf799e86ebe95220bf8df370bd74fdf5d48df3b57bfdbefbfb57dd5214f59f8757efbbef5ebdf2dbaf7eeabef987b71f3f7dee7ef8fce6cfdf76affeb3fbc32bfaffddff7ef3f1f59b3f7ffeaf1fdf751fdff299e9f4781afb539faf4c23ec97c77e380dddf9323ef08deffed7fb73f73f3f64e8bbb6e3d20de3f5b19f07be77497f68db6f6df9a7d3783e2fe16bdbebe57138f748e6725df93eb56df98e63ff384c67fbf055bee3323f0ecb357dd8f31dbabf7663f74fdd77fffae6dd8f9fdffee5cdf71fde7df8f8f6fd9bcf1fdfbe76f099b5ef7f28f9763f7c7f10faef9c834dea97c7f3a53f777d7f7ebc5efa8bdf52f6efbba15778eff25fe6e11dbfe43f3faffffe4364f7a5e93ccf63379ec38ee91c6ab6d7ffeca6f3dfbb6ffef0e3eb9fbb8fdf7648f59b377f79fbe6af6f3e763f7efaf4f6fffef2e9f7ddb7dd7f74affe91597e6096bfff74893efeb62af9ed611956552afdd834d9ce3ffca622867a3aadd4bfd1f36fce8fdf3e6c0af81b8acd840f2fe0f78024fe0703fbb049a2fbe337ef7ffce5fffcf859e4770ae7bffff8edb33cbe2afee125e2ffa67f7c5e455f19c44bf831887ffeaff77f62063ffcd47dfaf9ed4f9f3f7d611c0febbc7e751cfdd3547e61321eb40ac38bc7f1157e0f6565befff0fefd9b5f3ed3f90f7ffefcf6c32f3fbefbbbeec32feffebbfbcbdb4f6ffff4ee4df7f90373f1b2e9efa793ebeaab0be1f5cf3fbedde69aa9ffe3b74fca8f9030c2fdb82cb03a3d0e176cc3058bfd388ca74bbf5c5d10d3a97f3c4d43df9de7cbe3655c2e2ce2e9747e5cce5361d3cc0f229376de56a7fe727e101966cdd23c3d5e970b0be70bbc305f3da6df76978b3e00cacbb2c87d7c847082d7e971b9d29ff33c3cce23dea31bafd7c7eb30cf40fde3e58c89b7d180110d193679ae36975eb2f1713c8d74e161c4628ffd24ddf0785e309922cb324ce134cf972974f334627de13d5cae98d56a753ad7f7faf13c87d379b5bb8fcbd40fb4991fa7eb2227c43a2df3dacfcb7cb257c363bf60dbc72bf218cff4ea727d9cce7e6e7e64f0cbc37946acd7484aac5ffbd433821187805c16d8d0e672ee83e022025ca67ecab768d4f736522608ce6f9d713c4536cff5f5f93a3b2d8c7f9c8a6e62aa96eae3ccc4a78f23c469355c2647cbec9cc35b595e9d4eb1e514bad1697128200b038fc42745e2e4af4d301d7c0e5697c719c985f9328deb58c6d9cf4dcccee8d431fe7eb0e37e771cd7e12dbde1023ab68cf3922940d7a4bb3c8e57e6dec9dc94691ef946cddc3429147c6a8f42a6cdf9a4c6cd681cbfe398a7f98cfcf99dd186088f7c1da482e172be44bda6315a79c5df16304c0196c7f3f9b440a60e9e97d310563d2a2870bd66a5c07b4295d4ee5e9df26bd38cf1910c6ca6b958af1f97ae8f26b1e88665ce1218100d4d18c6824ad4d72ecb755d86279acbe84a2c528ce695d1f54cc422ddf97a254c49ab89051eacbf12924877466341265498e5715cf6d235a6805e35c8b10dfdfc39223ef5d775f55c91defb12fb78296d45d603d3a964554dd41715f5f73d55adfb3d766cb521cc42ffd8fbb5ea032bff826e45f05744621f0834676c9ad8b0f083c85cd6607ebcce6889887499d349bad2a93dafadd533f72352bd601a06d7fac8e267a6ec0433aa0e8fc67cb51ac6d210ecdf350629446912227bb087b2aa60fcdca66df13411b6191ec711496bcad1588c56e8fa214b48a94f2e072cd62916f24a1bec92f2bc3a8d350f2878f1c20694d5c4be295f2ccb705a91a78fa1784ecccdd77ffbd76dce5834d5bbcb653439c80c1183478497119b2872c50328412c7a4dd9dc2f924d8f27f3809ab2a98fba8d780e2c7226a87cd688c399fbd893fde756ba5d17a4dbb73a208c55a5c7cecd7123c4b3d7e9bacef512bb6a888b578df19f326fe7c7d3e9a4e9bb3c5e4fd8054d3d9e8404a0586dd8091b15e4a2edd4d7902015b2ffdc4a77db85a8c9bed5b19bd579a66af3a6970b2943add8eb10038ca0a7e19c153b9b7545d0da39e774baa65f88b97ff6813a3ce6073fa7e4b1b897d5c3d3a6c8fc5c4daa9fb3f36d175e82d879cdd9382c53b85d97a114fdccc24683cac42130555fc719b5213c08701970d1e928ea46276c84de69d1f17bd32c19814d02085630015300bf16b27cad4cec1edbfaf4d42a11d2becd93e06baa274200ac742dd2d38c1db3ef4830a219f13301cea4d09909806a12b255803b2c02fc6d64555ddcc01aec5c9c28279f4f2f6b0cc664fafb196da00b58eb3e0ab8278adeeea150ed18cb66076c2b87a9aaf53b11453ef87da224e33c1dd9a9e226c31dc2f8cce80969a8ca3bba6851836509ec5bdda373fd2e049426ec8e503759bd403bed059e1635801be1e399d8d256b831cd5e4be754b4d80109a7fdf74a97fbc7698a9cb1f83d0a58f1378ec89e11b9b95aa6d380d14e78863c87e11ad7bca72b07bec774e05f41a210ac13e23882270c2f4b9f654d2f7ae33842b39e8f8ff4d046a709f7d0eb54482b0ab9e2257a16cd828d86d9d4636d47f43aac064c1fb13392232492ee7a21f8a0091ed9261837569d0b9146315c6284c6fd83c872c690e773c6cd2244787e8e0ec8a9e858cac80a73c2776dc5104e847467268510f802a71e8f658e83925da7241813a58b91459b56276c75d1a9e8d22d2321986d30d00126c30c38f1e119532fa7530229dae056d10fbe7f22f087ca36c6c422c427e9a51273fee04d2036841305adfafec5b444ba9331144d288e6922a733d6f6a45183d519272c80d59d22014c19460de43ce1ce95c950512ad038923b098dda391b2d53048e24467a1b4667c6e8cc21eec49b7400af7a0dab0b059e7469e07bb4620a078d2ac325331481d35c712ad8c9c4520cd7e68cb37ae4cd4c9c7b92457e5f7a16917cac013a6f34c940069c7bc4d69bb93934da5c221094d7a4280ad81bb8672a1792b7602481ebb74e9889fe84c18610d67496a908322c89e8a214c38a5d4e26b028e18975452b929a1031030a0d3609f661439846911104a76e1b7e600580689a08a6822ce380c8581b94243332023db22b5aa1d2aa982b89e44a4ee43f67ecad4b8958b37863660d3ac38be5052fd5dcd9e67bc4003558e6431d85cea43422614a43470a7525b0ccf7f42859b959383864faca582fa440abf869b6525db13661744645e08c2be077e6f08ca004f626c12e1646175733b121a18be138223173509e7a52408549aa6ea497e131ad19f0446931fc49a2d3a9990836c09eac3ab1c7fce40e61c00dc288891bd0b9c96cd541b3c4626bc14e0b8b5cecac098cb252750d3250d1855b4b57fabbe7756c7540565bcbac9c30b12e3dba5dbd1859854c834b96f45ddb437c3547f9311d0beb426447b71adb1d766c75072959b048d060874de965c405bb4698f1824ca95d48e76df993e6aac903497696add3688d2d18d19e7460a45bc80bde2614416c1ee4e66b2bd96d078e6d56a2a8875d5ce790fe9a0bc7070c15fb69f107433d7dc0951c50590d895e40f0f1d503e9e0863ca5ab9eef79f9c9af219b26cd548b1ffc22197da238cce742313cbd5806cc8ef38f278845c75dda2d1c8a45e627b252a43dab63ab23529d4057b0af8802f33a13b5388729352c0c130c050d722276a095010c4b5047b3a7b3172db621c549ee1bf2fcbd4d91481a01b56d58b25ad83de1a5d080718712b1120ac20b2b63741de4966a9d8d5be8d0a605d6e5a4bb8d6541fe0c321d30f4cf9809ef7b4a28f63d759ef8bb92c18e2a8ba9e524d5ae55f8ec919201cbd7b842ee67b6b6b29a8cd4e2a98810522c4229cf8478b4425fcbc3357451ca0663393508bd6891ea053380d90cffd1f8d1a9209a1e4952fde64c965aa6d14aa70899df6a6a4eab4f1f2eabbfc4fc2cac785b0d14e1e0642cca0f411897809f6352f1dc7ece396cbbf0126453a309370e3783161291558f2eb1c44ce3c2c8d40036a11c0eb6937c2f8874202b5d69d29e9774fb5647649bc86b2227a2434c5f3a4122744e54c4e2d58b962156e3596bcb601fb4d565d04365171aa80532ab0d911e0ad76fa89c38d1daab52b09a636d38b60671889c862054b3e6de68b2a52b29ec791d5b1d90754951b11a579331f7ab9fa4044b0acfa8f9b8617254cbc8cdf99f166207911d5d1655831d5bdd41368d385dccbcb4e14bbfac2e6a3e27b6c7d2afc13e21ba9dc080c57b13971ac74915bfa924c4e68ab5672b419120517fc99962296d18d6edd756ffb0c70ead8a5343678582dca56a4fcc90e135f38898ce4c1b591dba81c0525940b3ac2c904db0cb913230b6ac102acd5b29ce8df4b43a13274147a63013994a379b938a0ce75498491ecc0fd7f20049193ba458b131d56a63763b40a385d15bb498f4ac24deeed667092b48ac136444e8f30577ce60d82e315d278db852f97328a45a4c0d6dc619938690e18597a69b606cf46057a0ab5dee0505312e0d00474260cab1209211632021c8f88a99c5848f203cb203d00fba0f90fe6cbd00245549e93047cb78851726c1089a44094e8ce1bc205f4b81cc2b2a409a881ed013c6241d95604298605737486cc518e434b3d0a846da26a93ec4440f558b2719f6df6c8454ec14b2af6e12dd2b030c0c1df7fbec05f493ca4f9b2ba9241035c50b56ca36a4f60e8e32a01b3c2297c982136d4804ab9357785bff01631b58c5e06bcc591014047b7cc6de9d48f8ce579c1d695e06e74a6115a0556ef9a062673331c57bc560a2a70f22fc400f44a867ad74e8934b4d1faaa13d535a87555ac180d90459d03110a665c4ee33be333fe2550aa38602e254256335ae74efe18caf32f322a9d05f449a620bd69b24de02073a061d9b737262f6cd9e45c65119d00613537462ea9d95208b4494cbe967423f382d241322a3e1b56d084b936c82b10a1c339b322cb4d0a1194a4fc4d8eccc5c9d08c1351c272a81315e440d23baa589eb4d5ccd9be791f053034d78abe160bdb839168363791ab910850d38acc2ced43d13c1992e3b3e24ac11872ef34e0f08f42b7534bb760f038c927c3aa56a30140e90d0490312f64e883b61b32a0ba76966bc90108b708dd3a88f175265034bdae1eb2604c376ee1809b52558cd64b5f608895f4e9600d10cf6489c030679b510c59ccf6602d2814df87f31983be7ec6a11e6c109fba2591041958beeac3a4887c2b3150d1d937f715983b0c1a6e43439a67b2044691476e17d52cba5b34e1a21e06e4fd169d2e2debd51be479a61cfcdd0235dec9105cda283a7cb1adb6670662b92e85a0baccaa2ebaf5a367a30639743e7ee143fbaf6160b0c2aa21b3702c444232a8647661dd562b484e8e752ac708146116b097166a9f8b8c3eeca5b7ac7ebaa9e1912f50c5631ebb43063317e2743a547982c13982cc41c15c2aaa074254a57aed3a911b1329aaff72382036173dd5ea7ae63afed0fe56ffba8aac6b4a372a74c81f16aba844c39209036731fbb8acd2c899c30fbd44c608598fb1c0740774eca8d5e5e86ecce6b79dc8906a17656d608ad3b85951511f5094e298468b4afecfbc6fa95c14229dcc0a6971844d69a3d878c5a7735bab8e8f01bf484e5441b6d7610b4aa3c89a99efe15bab3c19b961d33aa9ca0b392a419a5ca6c1b163439d36aa471200ecfed2ff35e5a716642154060ec9887139b5f22088c6266fac97a4331c0f04a18777a85e9a92d32e463b946273569d5f09c4c7326013795a51456e831ad54f6ecfde2803495ba3296f2855d094a9826118a056960a9e2bdcf6e7a4987ae600d69c5f681dd6cc38e12277b64ac4e8667e9d248c4b05193acef8c6ad2738c9163c15f0c1ecda38d642045b64e0ccdc38961263875b238621256a89a7d47b738c41556c3551bed64a936b21a711deb24b370d8e513aba0064ef8826a850b081d2523c6671bbf471f50ebf94408a25a735860713860e889fdd2f4d34e841f9c784d9acbaa255b59b1c34f235cc044d765458e6cc52c4bd4a02b6b660a2bb7fb186978ede8e485ee616131249a77062d2fcc22150e8c195dd53aa5159109add0500393239dbc5010ad610cd7052f202f0a56a49542b1a71a259211658a6655b75ab26255e743b48116a78b154b876e4989dcf2c16171d30384dabfdda27f3957b2d1c90b85e86da5fd664f39bcc058c60c317e45e1149256789a15d9d1dde3b5710fa770df90e7ef555280474e74cf6ce0c9ed043e11d3c76423e7f8e60d89e49f915b32fa20d92df455005b4164afe0b327c042f1288b1265955fb4f4464f6e30c6d7e10041cc2ab48f0d5982a78653dbe64084fedb01429fc4e7462e338751ec0158cec5888d89c3ee22b774594d2daf03f7e3f7aa179a56ca68e88cdb83e80cbd00a340b0626c2ec420ee90b4d9d33113075e07249c5a3ad32c747e30c0c7be928a9771c376e2cb8391176985093cf13fb19317ebb907323bd1b27a01521a91842947aeb0732e6f4581e3187236404785ebfa02b2dcd0c5171909dd6045f715246a61d6443e920921b84841572cb986e7dc9898a45607e0964aa538703a20c7364f4a31655f172f42fa52fbf2f12cba036a38d41f91bee1a24125de876d6fbb4520b8a32ba5d8638756518a7d9b5a20382c8bd5868733716596a859a627d00c193159a8354ebb2cb6db4d0b35016cff9e8e5e1cb01720ab9d20b53e19ee9a301ae7bb4cf142c9904d35d6ec8cf3155a5ed4a4d66d431643d16061b4672eeb3d52a220088ced352a63db25b6829644e97c53b3e5d1b7d02600c279b92924b2a38bad683004d62077e95ca5a8a1078d5ca567f2f02c10ab6a389f606c5632990d72876e55ce1daf03f770da7f6f5b20bd1522159110a26c0562d9ec0787078d391041c2585219d423ccf664d5893d26d95790d55610f7525dc9b049be2a8462dbc4d0db8e0dd937208c634f5981591b5803bb1d5d6c85dbf2a93710eda0cb11aba951a236f37ed35aca329ef0843b6b32293adc77747779194aee5ac1a9454aacd44a385a077f7254320f558c15ce99e2c288b62ba2be83dcd2c5f2b4bcc269d7ea88542fccd51216122851ff8a2c886692b661fe0929984a138be431c8d713c4227b3227b7c50e4838b574ea3946c6f34f1e6159662a978a228718d47352e2aa8a618106a24d5b913fe8255b3a7bd1622f404ac548f2285f18916365cc42caf050b2ad9092b3ac9a5c72590ba8097e3dc76da0bba3532d5aec4548591e5d4f72746cde543b22c4403805a32254d18d10239e3bc82d5d2c4fcb2b74bb5647a47a814e7a4a43b33fb8fdac2ca80591d91476219d392069b3a753162daf03124e2d9d111bc67db25c4b804a68525138d8629402c6f2d4e63608dc5a3a7bd1622f4056bdb0a494c8153f67bd5259889528160dce17801baa6845cba9c86e5aad8c6e919a0f1d80293a69d278aa2085d48913252b46690cdabbc82d5db4a2e515ba5dab23b2f582cd4883012b92eb0ac15854dd120b8a2746fa0d927eede99c0f12bf1daf03124efb36d50bbc672a3dac866b6d35e15007f66ae9186968cac52d02b386cc3e34d0d7013a80d9215bb64687dbc12c666d0861618351fca9d0ec0e724b4611abe5f475a0248077734731dae011a8f7d17936251501d5154c24a3b3d511b9a5ab75b1e3b572ba6d559c6e91ea05cb213b4ad83f4ab55916887f4989dced638c97d1224538d36d4a27a3677a880cb95662c6efee0ae2b313601e732a4cbf67fcb8a5d6646d726a3e576414f91d33b6d2e29d2bd3a3edc920c1e6d4541b24acf674f778c969dfea80947da036c7069efa804a7bb2975e80712e475fc20f67abdd77911d9d16e2c0eb2548cd06ae33f7575802ec3c7a3434d605435df2e1be61100e022a31e6c593eeda620a6c22046e5ebf51166ef550cbb2c2ed79b695d7c5bb2140d409cbe2617f3506542bd9c62ee67d363548a619bce391a97b11f8ec1e3f92208789c9c14330d60a768b500b967ccf5b1616090e74e1853e67c70299120d87158189276814335f9630fb3eb03231c8f483dc92657c6654b6a1aa4a1dcbd54301a2caa21e4bb18c07724511d5c85ce012c0bcd5b7704655d2b7129135605589f281acf8d1fc9e7588b750e1ef013b2a454ea31db621d462f827796f48b116c9c4a3328b87a15264a6ababfa2150c31676f408e9910bad40285edd223bba52bf3dafd0ed5a6d483871904e85d155b3f2bdeba3dc2dd0d54a24647a8aa7b448a82645e008de2bb14f64302b32fb40218c627bfa7e599d3ed8b94a9c84d25ea04d686915c9648c2b708eb0e8d2afd0295594c0539bb5c584dedbada8ab7aebcea0fba6225ec1722b3c3b7c1b1db247d5dc2891173176ae0cb074b0714f6180277c5c3c9c7cab35c0722f17596718573a78ad74f2c2f471d0ab7abf9a4ed46b32a430e3a46f69c48965002b7629ce16152364cc50292cead0ece6264ae6fe72d91e96765d2d63a97a60cb820c052c84455ac4e690c22a3aeae454eca5b353a45314fd180cb996ad141658f653f1f8ecf1b9ecef22d06580a1bbc7ebc8fd88943a7b1436155becbd7755e80556e45a1b49609ed8fc02021de25ae9944ecb6b439e5b1d91f4c2f366ee1baa2457b62bed8518357fc6697e60696a45aad513b2a3a317075e1b529ce4be21cfdfab458581eccd489891d9a368ce081807080b63113d21913ffb6f2bb2a373465a5e5f468a93df2b596001af561c88b8195bf2226ac0d87e231022730b561681ef20d0c16da553162daf9720258b1c2a56cbac1f237d6521667d528cedad2f229e3fd8e89445cb6b439e5b1d91ea05e58a93b2c075603c6a8d78e183f7088279c547432d52ad36644f672f5a5e1b529ce4be21cfdfab5ee855f597c954d78d0e313d3b96148bef9e702170db21b774f6a2e5f565044e6a3edfab5e90d7b942d853c5c8663ef0fbdc0106d31ce63404c561163a080e76dda8be214a52b467a35adeb4a083fbdfebd3040c440d61eb4d0b75c118a277756225e7cc4221d5e809b92573f80da716c09f372daa035460bd05a06cf1f6e50c488ae2eef0196c0546b41473544f2b04a994b664f400cfbc6efbb177e4ed03074366e17e92de9a429f5570e3c8d5cba3f31c4d3fd0c98b50217771a1c375c6608871e829bc38204dbf5a045e2ddd3d5ec75607640d883135de5f49ac4174c6804874865c36c675b1b3ad4fba8bdc90251c6e3885eaa64db1b905323b8402ec6d1baa21ef815340f6006c6273349817c5bf80dcd2c5c3b6bc42b76b7544aa176ca1b2d5c817f9815da6c8811f3d8b2046e85b65d21d42bf5aba9a8c3daf43ab4ce2be4d692a67379cf584c86ee6a85ede344ab19368979f8e086adfd2d18b03f602a454021f885d4109f1051c842b1f02e619c960ee0beb05ef20b7742ac581d74b909a115d8715ac9cc7632b57bd00f350801829929a7917b9a58b5eb4bc42b76b7544b619a1a8a547b29e8e9ba819c1c7964123d8f3a80ce5945b24d2dfd3d58cecb1a2bbe1be72ba41ca7a1b139a32bb1e30da156789a5880f66ac9bc8f11641cb5a3ab5b3c55e80945e304a6e6fd4b89f45e1e67a8c263aea800ebfdf927816a8e1f275a026c2a80a4f91c8dc84d0ec0d2c0903c1ba85dffbc08eca6968396d4842294ede1814b46d3665a05ca48324a65fcc203362de0e51281c653a5385753c2270bb457674a50c7b5ea1dbb5da9070caf7b65e70ce424f458d9d4c67edc5350185988f05487b07810e6e2b5df562cf2b743bee4724bdc0f071caac4eb9e65680cb936426c764dcd1f17298fb1814acd05b263d87a7573210d24bcfabd909599d2a27e1ee44ad3172c73c96c2babb724b9b561c1be2e50c86cdc90c779d373a107639a52b5ea4809ed5f0b8d29ad15381d49a81508ab84bf713960a63e79314563f388214b1f6a491678262205261930882a6dab3c22578e9ae101785e5108f6fd189bbac8cebd40a787155414a8434bb3901e58527484028712421f18eb986175e83a1bae51d1e249838b8183a5e23611e69d57b564a4eb8ac6ac3b9db543be0457421776246a37f39717e082302c22928562bc8bc5e8666c762d65e0b99cfd3c6876948a1904aac30555b8b51cc05699d2d98983a8fcba7aa1ee38b0c678a6ba1ea7d2082d7614849e9a27cbd96231985c8cc15d87aff3b274ae4ed3f7ace8a56279f3c13c1ca1129c2295547c58bf14f3e432b02f5a2a33ec6602f44789a26dbf0208f08053f2fcf4b87c0872bb13f58ef89395bb15f8cbf2dc4dc8e69e2745b1082faa2a3f690936bf6a12ed1d28a40229cf090454757d01eda906f667cf0e2d481534009cbf3fc2a4be642848f174048ec456cae40e63435974bb8d2a4802978d31f1aa131f5e607a7504ec940e19393a04cd37a3293469cc5ad99e36d1defa7b1f3cd58604492ede12e112c9b08e68dda5184823bd08b08b949cc400dfa4aa139916aaf599fa865148e0b4e4566a06f090925bc60e9d22adbfe6833b52bc7e6d94efaaf7e535dd9c8b8fa282b632bca220e8e13ca4c4118655db01039db5c082fcaac2b8a53aad5eaea9552e9d8019553c24e3bce898bedd91c4fec3ae340de4ba82e689c41a878c908e9f80ecf61b1266a696dc1a1d5918eef515a5383878898b93a57340bc6254797271341393dad281b29639657cc754b67ef5bece1801cdb542f103d77696af1c3bf223824cedb3f7c132b9dd3e8b43aab4e228396c829dbd329c3163b2051b5960e59b8969031fcc9f23c8f8e8b00e38e4aad09f28e5a021c64523aac094e28c2ada5abb5bbe7756c75402a6a618df32a516938b7c34b16de5937bf40e948bfd50b96b687a69d224d2ab2c757d4e2c9334df6c1e38531d8cc9a772a684461d0016a9bdd483a7cacc8761d60806d978e48940941104dd94d173e36a104c832ad75ce68222dd2859a456ebc9544b973b5f67dbbb2a65d4b2b8cbf379c32131c170e73fea538ed3f5772df63d27d0529b9e327f2b04166bf36628572589ca9c6a2e881b845e319f14c7e6e758370e9a69466a0dc16a744aa519ecba22a3a1c27e49d7fe9c8ed99c0f673f4bd81583e4d970ec026753a590b8535b4cabcee2b596ce5a11285c02e9ac223f4f48466c4e9c68a0867333687c3d1694707e6c6bcad7867a3e8d88be15804c8edd74ae4b748dba2fdfda9cf1c978e5de53188248e983aea5a2e350c714c2605768e7e0390aea40cc8b77dcd2db6d7e38df5756e3fc98946dc374e9f73585a3eecd6d528f0236556f3b5b5d73b2cfddcf56943d2a3954e33619d2a9e0b597a0947891367e59206bd204cac46c8996eb9d4f0af47323bd1b2fa32124ef95c09d070c9a93212f0b13a3bc18f33b57c3144118043c8cc3161860f81140259851492d98996d54b90ea046e3daff450a5f3511efb807bcc2508a201dc5d8d9b384ce1e36a88396813328095ac04b1e374687300d2010c5ac248f6877c5a8def8350bc239e361ad12006c15cf039cf5b9633bb25e2eb0d9be6f7b8b13d456901bae8b0dc41614539789c450ef1a9c13e5f100477e64e0815336f1ca1283bb21afc1e3bb63a2065b3dc83c02d7062dafc256b1f88d5e85d5c568f9183c51ca3199fc7203e132074f2aa8fc8e55457e27423e8ad10bb02d807d26e66ad9e86e09540a60de4e276abd7c5536fa1ebfcc8bc7ad193d21bf7bb5228e2aa999ff31491019a6dd8b807a1860917750e6cf6b532314a90acd19c4ee387bc0281ece084ccea7d0c63fa0ae3e81e8f54d63569bc3112b6c3de54948e9b6df693f0737b568553def5f81e02ea310e75213542306cc517a291a47a3a76fb44de950bc42e9fb59bdc420946fcc371549863d10ba9e7ab082c8b0f7750ea5e1b8cc8f5ea63c4d1ab30751be1ed260ac3c69fd7fb30e40ddb55128c186d5827beeae5ee112f8f285c7c4c21c9328b0f0baefa6815971b55b6e2a9500782db2881934af914819ccc811c2b8eb6eef3789885352386425623de64f073e8074361b016d6b0743527656fc18cc6822191fa1c65be9acb3ca8581d40fd9d5d7daf3e91cf60ca452e1c62e577a227cf15c99bf0593e66ce445db6e1e84d0d8e4c845916a260524f96b127a9e0bc698267858adabf54485d95f25bf0f6189d181b29f5289eef41b85078aaa83ec69e4e293cd17f7aa8d8980a59937c3b4bf24134ae255483e05b89b8e72223328bbae1949cc6afb99cc8fd1cebe895b674d2302da3af7bdab9e81abb4b2b8c967426e9662070efe1e9e7a8e9fa39b35aeaf122eb654b79170d419a7d64fa1ca25c86312bb7310a25fc5b3b911ede0261b303625ee94ff27bc7c10b9731f0f6da50488c24dcd152acf4d05c849bfddf96cc1eb4d89791cc6d3eb775027ba654dc9e2709c1d0c28d13daaa6acefba8bc205a9ba8aa574845a483db4a57bdd8f3da5a3d733f22d50ba20bfe97bef99c4a7a01e64db8a85e948ad483eb3500685026a7a80284ca3eb49c36e4b9d5117992840715b240c8be5749706cd5e7892c93229df4df80d45e61aa4a36036f7705e1584329ad87daf04c69c53a2e3a0e2884538e9b2bc0dde75601eeb07ceeb791d555198c4573e996c51fa7d1259b8e6103ea9a9a693a3a64b7b896ec1268e8b2521becd8ea0e5222f47003e6278ac385d914e971549c0f0cc66b51840c2e64af78d98a675ccb87ede856e7b0c358090df7f462d7063a620734d27045f614b69267027194ad3ab16031b3ae7ddfcd46dc12216e69a99c8e86d197002675fd547d9f24c429564f295c381366bcb16bac6a8f62e5d1426e7046958d276c2251ad8072217b365b8b8d6dfbfb3674dcbd7cb1a4c44d99009ca1efa9892da97331ae894510845b3335f81d5d26c0ece69697c3df2191d01ea95ee0977ca64c35e3a1c95a4944271440c03076944432053c036c2f98571daaeb724f57eb798f1d5ac1e948576a0065194e565e4d84331a1f40c4e2b52515211e109de48d15785116ae97758873b842bd4a829796aaef9c7173355322f1f8594653cf2780dc7e2d0ba9c18aeeb6d51d64932077bbfd22011c35a2751e49166bf1e237b5c18e9b81c5caf8368ac88e2ebd6fb0c86bdfea1e9d1244732a664216e4d55165e3097e74e46c2de8a0e885ef6f469739ea7587aee671cfebc03d9cf66d4a16ac19ab9bca6258f3103e4e05b5e4c342d02ed3451fc2b015b79e9dc996ce5eb4d80b90d5c06241bcddaf1b36eb7555e31dbd2e6bf8400e6884915d868a1f785fa116d62dd9aa15b750a87e1b2831106cd5e34446a4541d560b9f954d704ed9155688486b1629a02d20ee3a25ad7037a6aea823046f82e8babd9a1451f16a8e938af07c7450b2ddd7a2482d766805a7b64dfaeec3407a410fb171c77ccbe638906f65072b99e36924b7863e161626ceb591cd1184f2507810a634bb4360a44426860cd5c8ccfae3ba0963edd97b1e7ceee20d68399dac8a31f33e75e3337bc15222a215058dca1e71e4d2b15eeb917e924e5e3677d0ec58f33688251a2c0485437a45fcee61dbdc40f71565dbb0120ac1d2543f89c8720bc33b30bea5ea6929c22e474321a13879af3e62f1d84995b6395b4fc0693fd9b2e09278e8d8bb40505c668afecb89138b85f00a47766aa4c3a1d888480d1395b39296fdbcfae5069608475a28f8b0d946e2930c806d340ae0d47cdc92b380ee991dce0ac91ca54a544e9bdc13b30dc9e7b649c79f00407862d9bfa21539803d3057d530c0099f630f98a135e5ab835388d383153ebc97b39999182fb77b21d28d3cea0b34411fbcdae02eb1d56a1042791e5ba2090a956aa5ac557c766829bcf82d720916b55347231edab58fd92b54022801ae86ed40530f37a23842c5c160e928eaa8a2d2c5edfb39d6b54b2ec7aacc6b7260ca67dc3de543ca47a587ddd3d48ea573df0a872386fad92b268a5506e20e1ea16b4efeb89bc3eee3e2cbd8906150747fb0720a1409c783ead15cb68cd9cbd7aed3933a640fe2432f45c773917e0ee1e4f518d318c24e3869af7374d87709b21d8df632b0d0a1dcfa165b11c96aaf49fb2fd8064f47a23bfa37436d2e287a409c455266c36c29493e619b6d70009e6d35a3e6f46b190d2a8c7a74732f7eb0973a779e3f12c351d6e8a81b56909857d695005bb17a1094d7f36fab542a5b03abeb741e8075efcfc3bf1cc185b7fb7529ab2067df60958ec5a529b4e75c84adef61492adae1aa1ae3755a7cc0d4362475952e1296e069339ababc8c6ad44e04f342becbf7a0a3e2cf62a107d4d8ebfa835dceeb2dac734f0aa92c53bdbbc32c704112045b50af08790e99ced14f789135a81acc02bbca20d81562547ac55e14aa2cd97aa48649f74899649828c5a2b2603ad460a23abc26085565ae16a70d0cd169102417f3e72984fc75932899cced65549a60908dc190f17d7ba45f8b3059766ca4fab51417ebc9a2a7476ef2e754b234ad95b8364857ca3aa8882c005795a5251b61248a11f5da42b82ec86c7a901fbb98c125a572e5bb88ad6e6ab2523207a96bd39a1943d6b056c7158a062aaf7da0223eda25c258e4e4264de6dc29d327c0897a62cd1d13946d0331dfa5f31e1309056bd1ef796cd91eac6fd3c092c5e2e7589eb87a58b1927ceb8336ec5c330502b9730ec239768d289f70984576f178bda6cfbf92a0196783b20c1dd533a7805a315baa6942b1a1ac11f2d95ef822dcd02de292d8135e1969eb41b8112227a699c7ebec25dc75f2f680a70291098d4edcc006c1e6e1c58260c4d1384c3dfeb40afeb4e22fbf84159bdacc01fe8e57d61c2e0a965d789f1e350c96134fa9959f644db1d8e1c582a857eaf00c21434155c76c257b074f8fc490ea7370589d140fe4224b7d3e3dc9d5510c03a3d55130c838c4bc484d232d1e0aae27a55c12d6fc610bfa6880911938841c7891082e6a49d7981f8338c4944aa7b3c25f50b09b182ff61532baab27540f74892758d327b708113966b8aaf338009c6f30f6ff9c183c41ead1cace1293bc281bd754f11a72c526601639e5852da8b9e26eccea96e382a4db7d4f8d42497d0e462de7e043d26d349f3e28645490f2685aa5ba16cdcfe36f2d5d941ad5c50887176f74d7bd216cb7163fab88c0065e78d25c91803b6509574c43272fedb2f540af6050387fbaeee3ae8e2ec6bf9ca401e49d613a4aa324620d513a85e57526725607635557743080409a3dab88583616b69c898b1151901d95926292b28de861271da29c10b62fe0c82acfb089f00cb4df63da0cec0e64b2c2db11f1d348374444292b949fef17b6799816d853dde3b4f15e5d9c29f1e16b950b180e207d5defed3d9b7a371bc1eaf668c3ef38dee7df77344e54cbe70508ca4f6a88fbc89bb64a9d38d795a4ff226c4108b8262c48fc17a93e00094712c3862a56b16174e07c004a02de364f64a53e95ea1bc6f8606a742ce7b3ee23b77451d7965702a25dab2352790d96d8ca828670b13eaa41b1caec6e28188f7bd533783ba4daece8980be976d8012903b66b53bd6095d4df4988b7ad73011adf1c75c1a5b8c7a2cda4c68ce1c168f257494c645a3a7bd1622f404a234ca73097f02705643b37b210434fc5f07d9ad2fbc80d5d8c6bcbabe86e5aad9c6e916d46f256b76ec897eecd92912c955667c9f84d93781ff166ca46a75ed8ea168bfc77c8b10d74ac0edf5ea5d6191de0f858390732943ce2a1d374d741d7433ca0797513db6eb56476a2c5be8ce07b89b1fd5c3a4160c886ac860a53698dca358aa94b0e8a85c3c5564c4b7a8aba6a19791a256da4c308ad74f4');
SELECT pg_catalog.lowrite(0, '\xe2c0eb2548f5027feecb3cfa10b61bcb52600fb4d4623c83e637d119330791b8c7248ffecd83273a7bd1f2da90e75647a47ac14d00265e17880d4c210b278832304c30ce616b6b09e378a427add84aafc06e47661f1a4e2d8033685a944624fe76c894823da3a75e8aa9c1603cc167b8d02059a384983774aa44cbeb05c8ba4609e57c02d12f7aa5a73a91031442f86ab223d49e0d4785c5fc5b6f4b0478439615da706adb1c88d685816bd0571bb879c0d10e90d1e4e93ced12477341aa80402b66cbf37a8eef962c8b13054ebc02196f40d543c9c651297010d4e5902b632131d4e89179515f8755437797d7b1d51129bd32e93388217223148b032046429f2a9aa31c65d2d42068514ba766b5d80109a7fdf74ab9083f52b12184dd9e07c4ecfb27000cff3931a30c090334cb0932494b637f7664aa56c3e9eb001d80131e94351c3173b2afb49b3a52a69ae5555ae48103c3012a6964b3ea554b668cde622f416a2e4c743cc146b9874bd7ea1666853c542990b2b98c340f79d0bd12b38a5f6fa95407daeca00dc05484f3b1457d1f7f5fa93925726b517680e8c660d58d13eb38fbdf99cf96c6cfb7d80b905ade5092f4325c2a08d8afb2b5609e440ae6e941b9dd416ee95ce0075e2f412207834a5f274f05863323295493a9d4db35e4677948dd5ad501d9d13915075e07e4d8063a0354eff898485a0b2b7b0b447cb842fc7d2cc4df20473225d170fa2280c7ac6f95182acca203eb9d42d4c1c21ea1483096021ee62e92f0ec894e31b4bc5e82941858d0d450e99a9fc698ab9458c71cfd15c36edc05ea55d98d4a31b49c3624a309ef23527db0444aa53ed782f42cf601a112aad02fca1494dd36a01a0568a9ec438b1d902ca9fdd7d2078bf6b9008053e311de727d845dbed5aaa3e3ae87d16983608e5a3a7a71c05e80d402651eb96960624c818b6aa79210731682e508f47de496ce057ae0f512a4e6c3dcc0e202019e5bf3b1948cbc66684a1080e5e44090bda2b494d8845c98d7b93524262aebee01586e95d8ca3fc49a8c397f9a55de3ef32fb2fb5a2cac67052dcf49e7217d35c2f2b2198b9417df22da03d56247551ab1e714b25dab0d49409baf6d5218afd43db3a940e0913e5026f001b9da31702bd30ac01dc423906e4648672f6c75cbeb25c8b636a8a7b80e703a9ae792c4fa68382e347727582df99b58b6e266a1b9b5758ce4bfd468acd7a911f1ab96ffa901ad7f4dc4634bbe77a876e569630bf2fe599a201c6a24de82ee4ae51604f76671055e1ca484bde77e71989ea0a35f6054dbe2bf792fd8580a9e89b748ef18be0ba8c8d22664251c7605d84b20142101a818498159a5072318544d885db8d61284cb5b55c6912e48e88a17d9beaf1eb38028ddaf9356f7ad89bbeb2164322d0f3dc7ebe7c93be787a50e62ac5ffb0494c708ea10169aee869b4b11cc9bd762d987f802025dda844ec1b7bc36e4b9d511a9e9372e31e36013c03fd5ebec630f4a58182c03147f4f8ba7df77244aa5e1d202aca5a6457d1c917b2b4413ec5f9af0e3cc76858d9612c84da2c874cc4623760e560d557d9fb3ac8a97bc9deabc9c8824990367988a42a5526c899984a3b0fed58d0c0c2ae672a55292304f1e88e3616dd5aca8d6896a70a49c4ea4d5369db4026099ae74cce64a67af087893bdb168b6e71e087d52d004cadf2ad066b221ad10722c45b52bb2ac48c9e4e436518a03de295a359840660d36b92ea1a0507d77a5b40be4952245164b11325891dbf0f00ef3496e43a61e7f4cc8cb0165c44792924d1a5be5f8987952deabd9e8588f2b5d0d306535c34beee56fbe9da8472b8a41af88d7cb152d221d235ce9eef1520e7bee47245ac4447392c65b9148842b14ebe423ba1a257fb9d0509f5647c463a84f744aa7e5b521cfad8e487a819d73c73507b16a1d8970b22a1b8fd9115881b479026e68f87ec3a5f99dd30dfbafd42a229566752371a6d63f45e13242877c3f2a86247ffdb34558472d5dcdc29ed7b1d50159230b0c9b0bd76a2f37e22ab240557ccdbe3014123b75007654892b5a4e92ed5a85d11e2949e0b0f317042c25b1bf93b8020cab8224c0d8a7443677915bba2cb99657e876ad8e48f5026b926a1fdacd7e68a60328be52648d526e013ad51039170df44520ebc82fd5e7b5a0561c4839297e57b00bb602b8ac18d9e6d75b0a272176f896cb4b90fabe63ccb60afdc7326d9350d7eed9acd130d1a6fe9e8b35494f1f8adc52650a1a0c956d90bb74e65e14433c45a4d3f0fc982b820cd8cb3c0579fcaf458e6435093b4e07d61bc024d4b74a08f8740f062496f4353c7b804df5ef306473c7431992b2345cb92cc5ecfe1619bc084125a30798a4fc315a3cb455aaf26c149c5069208e7fc908a7934d29100ec854b1e5862a334a7442710a2af59f332c7609cc3f5f1b8c8f7e09b9a5bbcb2b9c6e5b15a71d528271633d1bcc9c71e17e5ab483e8c5c35596a1a97bd07bfa75447674d18f969774fb564724bda02ac7e93d63034f1aaf57bccc17dc33741fb6b6271a84b968e99c9f163b2024716d9b92057e3a17fb2cc8f3844066c4ddd31c8702b394a65bdf21286e4ba79eb6d80b1066d2b5c2700da6554bfe7adaaaa929d8780c4373a190eadfd75f77047ebd78a0b7c563039e981e807c1abbce59417d0669b517ff504931cec9c56bfac3139256cfc88e8e2e1c786d483885fb863c7faf94814025effc59a2f57c824b0cbb94034960b9a4b421441937c89e4e6568797d1909a77cafa6813c9f537d48cc6721c86e5d9ee6fe991ab12cf4bb0874f101a1733a5a5e2f414a16d8b0bc0a4145829307b56fa4014a0d13cc3f9a5e26a945a463f1ac74caa2e5b521cfad8e48c982f09a6393d19e3ae98aa524ed8a7e712ed25511a05a6cc02d8d52d873697e6719edffbdbe4ccc595b5698a235eb340ecdf11366864d5ddd5783c0aba5f3fb2df602a49624bacc5eaebae0de76996a31b6ef8271f8ccacf92e724ba7a93ef07a0952b2b03699ed3bbc29a9714c3558ead96eb1d75987bbc82d5d4c75cbcb72db8e3bf26a91d24836503c8118cdb278eaea747f668ddcd94ef2a4a7fb783910844bdd7658f774ce0885a3fc0d217a0f4965bb1eb94d2d8a7d199fa960da3808a4f03de8b51e23d893adaceaac1a4736ea814d99e78009ccfd834dc7cfbdee7eeafaeeafddaf9de139d73899cf13ffff9dbff2a4a92720b9c55a27de06d6bc9f7ffdfec136ef3b4c25c9a314ef9e7ec65fbd03c87f7ee607dbfdd0fd0bffff35ac38cb3875a6b7d4f59021792b7e8fdb1fe68e0bd7e23ebee9feadfba5fbeefb4f1c9bfb1406a7eed3eb430f6f3b48272dbebdeffefe55471dc28fd67f1e5ebdefbe7bf50ad175af7eeafebdfbe687d71f3e7ecbcc75dfbcf97d3776df76ffd1bdfac7ee0fafd2bdbd08f61fe025f03bfcbb1dff6ffef943f7e9e7b73f7dfef4fbeedc7fdbbdfacfe2ecd0a9a69c3a972fa742b7312af8b1fba71aebf73fac63fde1fbc3586f668338c0ca1423660390c3d0e9564999b926575e60f3aedb7e762fd5e9a8ffb6f32133feacc4b51b88f25270c5efa75a41a48e61e1ecdadf3e1dfe610fa6f56f9f8efe85d3e107381bfc374dc709dedb74b4bafe3cd172e63edad7397fffe1fdfb37bf7cfe7df7e6fffdf9cdc7b7fefce20ff817338f9ada68d22f1f3e773fbdf9f1d3db3fbd7bf3dcf35691ba8f6f1e5c2cbfa94804d61c0065555073e26f79e1c4f2531e8743b1f8675c3ee7a62e1c86e140180b99d0c707a2e8e5baccc9f1291346b15cca0a901084577dae9a0dd28ae28a1fe4c1b845e38176525145b12e907a0181f628277f04f0892ba1352f38e139d5d75888ff0fc2c099410a656e6473747265616d0a656e646f626a0a34342030206f626a0a31343131360a656e646f626a0a34322030206f626a0a3c3c202f54797065202f50616765202f506172656e74203320302052202f5265736f757263657320343520302052202f436f6e74656e747320343320302052202f4d65646961426f780a5b30203020383432203539355d203e3e0a656e646f626a0a34352030206f626a0a3c3c202f50726f63536574205b202f504446202f54657874202f496d61676542202f496d61676543202f496d61676549205d202f436f6c6f725370616365203c3c202f437336203436203020520a2f437331203720302052203e3e202f466f6e74203c3c202f545431203820302052203e3e202f584f626a656374203c3c202f496d3220313120302052202f496d31203920302052203e3e0a3e3e0a656e646f626a0a34372030206f626a0a3c3c202f4c656e67746820343820302052202f4e2031202f416c7465726e617465202f44657669636547726179202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801a557075893d71a3eff48c24ad85346d8c832a0ec199901640f41546212481821068280b828c50ad62d0e1c152d8a52b45a11282ed4e2a06e50ebb8504b05a516abb8b07acf09a0d0f6b9f73ecfcdff1cfef77c677ceb3ddf7f00405dc89548b27100408e385f1a12cb4e9e999cc2a4dd030a4017a80247a0cae5e549d8d1d111700a10e78a05e83df1f7b20b604872c301ed3571ecbff6287c411e0fce3a055b113f8f970300e60d00ad8f2791e603a06801e5e60bf225088742ac95151f1b00712a000a2aa36ba118988408c402a988c70c91728b9821dc9c1c2ed3d9d199192dcd4d1765ff83d568d1fff3cbc99621bbd1cf043695bcacb870f87684f697f1b98108bb437c98c70d8a1bc58f0b44899110fb03809b49f2a7c7421c06f13c5956021b627b88ebd3a5c10910fb427c5b280b45781a00844eb1303e09626388c3c4f322a320f68458c8cb0b4881d806e21aa18083f20463465c14e573e22186fa88a7d2dc5834df1600d29b2f080c1a9193e959b9e1c8063328ff2eaf200ec9e536170b03909d5017d995c90d8b86d80ae21782ec10341fee433190e447a33d619f1228ce8e447afd21ae12e4c9fd857d4a57be301ee5cc1900aa59be341ead85b651e3d345c11c8883212e144a43911cfa4b3d21c996f30cc684fa4e2a8b45be431f69c10271028a21e2c552ae34280462182b5a2b48c4b8400072c13cf89707c4a00730411e10810239ca005c90031b135a600f5b089c25864d0a67e4812c28cf80b8f7e338eaa315688d048ee4827438331bae1b9332011fae1f5987f6c8850df5d0be7df27d79a3fa1ca1be00e3af810c8e0bc1001c1742340374cb2585d0be1cd80f8052191ccb8078bc1667c82367102db775c406348eb4f48f6ac9852bf8725d23eb909723b605409bc5a0188e21dbe49e93ba248b9c0a9b171941fa902cb936299c51041ce4726fb96c4ceb27cf916ffd1fb5ce87b68ef77e7cbcc6627c1ac62b1fee9c0d3d148fc6270f5af30eda9d35bafa5334e51ad718c86c2492aa55319c39b5728b91efcc52e95c11efcaeac1ff90b54fd91ad3ee30216f51e37921670aff6fbc80ba28d72957290f28370113be7fa17452fa20ba4bb9079f3b1fed891ec707147bc41c11fc2b823e8e316084593cb904e5221b3e282f7fb7f353ce46f6f9cb0e1821d78b38cb96ef821896031bcaac409ed710a89f0bf39107a32d833c45dc70808c199fbb112de34e407b49ab1e6076ad3c750130ebd59acfcbb5c8a3dd4936a5de50692f4917af319048e6d4960c0b249f46511e04cb235f4682527bd621d6006b0fab9ef59cf5e0d30cd62dd66fac4ed62e38f284584f1c258e13cd440bd10198b0d7429c269ae5a89e6885cfb71fd74d64f8c8399ac870c437de28a3918ff9a39c1acffd711ecae335162d347f2c5399a327753cf7507cc7330665ec7fb3687c4627568491ecc84f1dc39ce1c4a0316c192e0c36036398c2c799e10f9139c38c11c1d085a3a10c6b462063d2c7788c9c7164073aef88616375e153154b86a3634c40fe09210fa4f29ac51df5f7af3e322778892a9a68fca9c2e8f0648e681aa909633ac7e22a67c8849395003589c002688714c6159d7631ac25cc0973502546550832129b25cfe13f9c04d298742239b032450126c9265d48ff518caa95377c50ad1aa9de0ea41f1cf52503497754c7c67b00771f8917aa68ff6cfdf89321a07a52ada941546bf9de72efa881d4506a3060529d909c3a851a06b1079a952f2884770f0002722545525186309fc986b71c019323e639da339d594ef0eb86ee4c680e00cf63e477214ca7832793168cc848f4a20025789fd202faf0ab6a0ebfd60ed02b37e005bf9941f00e1005e241329803fd10c24c4a61644bc032500e2ac11ab0116c053bc11e50071ac061700cb482d3e00770095c059de02efc9ef482276010bc04c31886d1303aa689e96326982566873963ee982f16844560b1583296866560624c8695609f6195d83a6c2bb60babc3bec59ab1d3d805ec1a7607ebc1fab13fb0b73881abe05ab8116e854fc1dd71361e8ec7e3b3f10c7c3e5e8c97e1abf0cd780d5e8f37e2a7f14b7827de8d3fc187084028133a8429e140b8130144149142a41352623151415411354403ac01edc40da29b1820de9054529364920e308ba16402c923e7938bc995e456721fd9489e256f903de420f99e42a71852ec289e140e65262583b280524ea9a2d4528e52cec10add4b7949a55275607edc60de92a999d485d495d4edd483d453d46bd487d4211a8da64fb3a3f9d0a2685c5a3ead9cb685564f3b49bb4eeba5bd5650563051705608564851102b942a5429ec5738a1705de191c2b0a29aa2a5a2a76294225fb14871b5e21ec516c52b8abd8ac34aea4ad64a3e4af14a994acb94362b35289d53baa7f45c5959d94cd943394659a4bc5479b3f221e5f3ca3dca6f5434546c5502545255642aab54f6aa9c52b9a3f29c4ea75bd1fde929f47cfa2a7a1dfd0cfd01fd354393e1c8e030f88c258c6a4623e33ae3a9aaa2aaa52a5b758e6ab16a95ea11d52baa036a8a6a566a016a5cb5c56ad56acd6ab7d486d435d59dd4a3d473d457aaef57bfa0dea741d3b0d208d2e06b9469ecd638a3f15093d034d70cd0e4697ea6b947f39c66af1655cb5a8ba395a955a9f58dd665ad416d0ded69da89da85dad5dac7b5bb75081d2b1d8e4eb6ce6a9dc33a5d3a6f758d74d9ba02dd15ba0dbad7755fe94dd2f3d713e855e81dd4ebd47babcfd40fd2cfd25fab7f4cffbe0169606b1063b0c06087c1398381495a93bc26f126554c3a3ce92743dcd0d630d670a1e16ec30ec3212363a3102389d116a3334603c63ac6fec699c61b8c4f18f79b689af89a884c36989c3479ccd466b299d9cccdccb3cc415343d3505399e92ed3cba6c366d6660966a56607cdee9b2b99bb9ba79b6f306f331fb430b19861516271c0e2274b454b774ba1e526cb76cb5756d6564956cbad8e59f559eb5973ac8bad0f58dfb3a1dbf8d9ccb7a9b1b939993ad97d72d6e4ed93afdae2b62eb642db6adb2b76b89dab9dc86ebbdd357b8abd87bdd8bec6fe96838a03dba1c0e180438fa38e638463a9e331c7a7532ca6a44c593ba57dca7b960b2b1b7eddee3a69388539953ab538fde16cebcc73ae76be39953e3578ea92a94d539f4db39b2698b663da6d174d97192ecb5dda5cfe74757395ba36b8f6bb59b8a5b96d73bbe5aee51eedbed2fdbc07c563bac7128f568f379eae9ef99e873d7ff772f0caf2daefd5e76ded2df0dee3fdd0c7cc87ebb3cba7db97e99be6fb956fb79fa91fd7afc6ef677f737fbe7fadff23f6647626bb9efd743a6bba74fad1e9af023c0316059c0a240243022b022f07690425046d0d7a106c169c117c207830c4256461c8a9504a6878e8dad05b1c230e8f53c7190c730b5b1476365c253c2e7c6bf8cf11b611d2889619f88cb019eb67dc8bb48c14471e8b02519ca8f551f7a3ada3e7477f1f438d898ea98ef935d629b624b63d4e336e6edcfeb897f1d3e357c7df4db0499025b425aa26a626d625be4a0a4c5a97d43d73cacc45332f251b248b929b5268298929b52943b382666d9cd59bea925a9eda35db7a76e1ec0b730ce664cf393e57752e77ee91344a5a52dafeb477dc286e0d77681e67deb67983bc00de26de13be3f7f03bf5fe02358277894ee93be2ebd2fc327637d46bfd04f58251c100588b68a9e658666eecc7c951595b537eb437652f6c11c859cb49c66b186384b7c36d738b730f79ac44e522ee99eef397fe3fc4169b8b4360fcb9b9dd794af05ffc1ec90d9c83e97f514f8165417bc5e90b8e048a17aa1b8b0a3c8b66845d1a3e2e0e2af17920b790bdb4a4c4b9695f42c622fdab5185b3c6f71db12f325654b7a97862cddb74c6959d6b21f4b59a5eb4a5f7c96f4594b9951d9d2b2879f877c7ea09c512e2dbfb5dc6bf9ce2fc82f445f5c5e3175c59615ef2bf815172b59955595ef56f2565efcd2e9cbcd5f7e5895beeaf26ad7d53bd650d788d774adf55bbb6f9dfabae2750fd7cf58dfb881b9a162c38b8d73375ea89a56b57393d226d9a6eecd119b9bb6586c59b3e5dd56e1d6ceeae9d507b7196e5bb1edd576fef6eb3bfc7734ec34da59b9f3ed57a2af6eef0ad9d558635553b59bbabb60f7af7b12f7b47fedfe755dad416d65ed9f7bc57bbbf7c5ee3b5be75657b7df70ffea03f801d981fefad4faabdf047ed3d4e0d0b0eba0cec1ca43e090ecd0e36fd3beed3a1c7eb8ed88fb9186ef2cbfdb7654f3684523d658d438784c78acbb29b9e95a7358735b8b57cbd1ef1dbfdfdb6ada5a7d5cfbf8ea134a27ca4e7c38597c72e894e4d4c0e98cd30fdbe6b6dd3d33f3cccdb331672f9f0b3f77fe87e01fceb4b3db4f9ef739df7ac1f342f345f78bc72eb95e6aec70e938faa3cb8f472fbb5e6ebce276a5e9aac7d5966bded74e5cf7bb7efa46e08d1f6e726e5eea8cecbcd695d075fb56eaadeedbfcdb7d77b2ef3cfba9e0a7e1bb4be125bee2bedafdaa07860f6afe35f95f07bb5dbb8ff704f674fc1cf7f3dd87bc874f7ec9fbe55d6fd9aff45fab1e993caaeb73ee6bed0feebffa78d6e3de279227c303e5bfa9ffb6eda9cdd3ef7ef7ffbd6370e660ef33e9b30f7fac7caeff7cef8b692fda86a2871ebccc7939fcaae2b5feeb7d6fdcdfb4bf4d7afb6878c13bdabbcd7f4efeb3e57df8fb7b1f723e7cf8372d5df01c0a656e6473747265616d0a656e646f626a0a34382030206f626a0a333336370a656e646f626a0a34362030206f626a0a5b202f494343426173656420343720302052205d0a656e646f626a0a35302030206f626a0a3c3c202f4c656e67746820353120302052202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801a555cb8ed34010bcfb2bea9848ac332fdb638e040e202d62379638200e8e9910831f1bdb21da9fe55be89949b2f13ec22ed8076bac7679aababa66832b6c2014189254214a2374069fd16036ef398a1e2c4ced15c7e074f7852db6653534d7611c27c22dabe0b864a83c62853556846c6ffa7043584912c994c5fe25ad5422d398aa055492a2a8f12683f65ff84790d5986599fd77b6c264618ab6f986c5606ea6c87ee05de6083c05cc858462ca0307d2ff77ff18035fe66583a2adeb72188c798d3b74122276429ce7607f25131e780e6e5fb34fa62bcccdb0cd2b7425f1e7228c622ea5a36f17114b34bd15a12619a5d4a1d2b43b8298bdaf65f0b62572c73e1c649c5d9b2a1fca5f66de566d57d666e8cac2e33f2943c4083dd9efed8c0c5f3099b74d5ff6438f7685bcaa30ac0d8a755e76535c708d496d1a4c83afc83e78f15f4a9245218f537d8fe43f723ab416234e63cf584ea7fbcf1b4bcdd2aa473d47d9e33aaf56d4fa23bbe085ec44c2431d1d3b08dfc1c7c805ce10e71a4658fb811891c3c8b744ee633ba0df76d3c076c760ddeec8a8648ce63b766df7b37f85e576c00df5cf16b4cb7c59dd3afa273ccfcc2627ef88e77867d2e7b5c12ebf45dba12febb2cabbd331ba1b06cffdfc3008f28910da8dae1d86ff93f2719f8ca59c646489df0dcdaa8d01d30c185aa7d3b6379d35c7aeb3d9d060794b03f08cec21e1f8337a18500f1f0c59de9c76476207854b9f05f3854f4f2ce60fda76610de53355523a0bc92270a942265265a7df266b0d114721050fa70525f56141795bd11bf758ef2b1767d3554694ae0e9752db9d2164157b94b07bcaba709d1fc2f5245aef3ce1022c8858c89460c261448ac69a48e8942339cc14f746d820e2b654fb48a752c5e350124d5f1a90679e2e25ca32a153e82fa84a430a160aa5133a1dad7e84aafc06aefe00c59bc0ed0a656e6473747265616d0a656e646f626a0a35312030206f626a0a3638380a656e646f626a0a34392030206f626a0a3c3c202f54797065202f50616765202f506172656e74203320302052202f5265736f757263657320353220302052202f436f6e74656e747320353020302052202f4d65646961426f780a5b30203020383432203539355d203e3e0a656e646f626a0a35322030206f626a0a3c3c202f50726f63536574205b202f504446202f54657874202f496d61676542202f496d61676543202f496d61676549205d202f436f6c6f725370616365203c3c202f437336203436203020520a2f437331203720302052203e3e202f466f6e74203c3c202f545431203820302052203e3e202f584f626a656374203c3c202f496d3420313720302052202f496d3320313320302052202f496d310a3920302052203e3e203e3e0a656e646f626a0a35342030206f626a0a3c3c202f4c656e67746820353520302052202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ad54cb72d34010bceb2bfa285711592b59af1345420e702294aa38241cd6cad85a90b4b25676c86fc20f31ab8781836d0a621d54b31ecdf474f7ec0e77d82158c14792ad1065113ac2273458de1881c2c0f732fb8b63087e4c61936d5a8d54a45e1c27c11056ce31f4518d152b94d87065fbf0873bae95245198f9f178c8d12a09b3186118619564286a5ce748c72fc69793d758e6b9ed9d6fe0de7eeb3b6916c8bfe03667eccb0fd415d4f67b59a153dc42045e148b301c3ad820f2931469e405519472a738f1b2204c1d6eb57c578778ab6d958f54c95e1de84657ba5335f59d2ac67aa7200b11d8620cd961c8e138d1f4fa03f23ddcbca46e0191c2252803893932d41d0895323d36ba836aae4abd37c4ff3b43b62139a51625a82f3c2cf019f9fb7f9cdd0f3c3f112f33bacfe6f88bd1af49d6956a08b56ce4963a14b281d96fb7c433f7e54c0481acb05838bfc63b6d17cb7d10a7935d4e70efb05d98fbb9c341d11375060feef7f968735485cc8fd70f0bacf716133da3942c4bafb1264bb833137e0151b83a8f880dec3022d9b613027da047ac9f6d4f14a5547c7c657567aefe4b6811675e94f9d18b282d06a22f98dc7dd3b6d5b36ab6838f0d1da8e3855c4fe29b41f55a7e65524b4e32acf3bcc0e739157c318c97c20995274e0b5db7952a644f8faf605453106fd991e6561b4653ab6dd9f33da467fd51f209f46f5c3bf6323cb7f1c20f2ee281abd9efd64b957eb2e565a35961dee979e6bb9f4cfe614b0a656e6473747265616d0a656e646f626a0a35352030206f626a0a3535300a656e646f626a0a35332030206f626a0a3c3c202f54797065202f50616765202f506172656e74203320302052202f5265736f757263657320353620302052202f436f6e74656e747320353420302052202f4d65646961426f780a5b30203020383432203539355d203e3e0a656e646f626a0a35362030206f626a0a3c3c202f50726f63536574205b202f504446202f54657874202f496d61676542202f496d61676543202f496d61676549205d202f436f6c6f725370616365203c3c202f4373312037203020520a3e3e202f466f6e74203c3c202f545431203820302052203e3e202f584f626a656374203c3c202f496d3320313320302052203e3e203e3e0a656e646f626a0a332030206f626a0a3c3c202f54797065202f5061676573202f4d65646961426f78205b30203020383432203539355d202f436f756e742035202f4b696473205b20322030205220333820302052203432203020520a34392030205220353320302052205d203e3e0a656e646f626a0a35372030206f626a0a3c3c202f54797065202f436174616c6f67202f5061676573203320302052202f56657273696f6e202f312e34203e3e0a656e646f626a0a31352030206f626a0a3c3c202f54797065202f466f6e74202f53756274797065202f5472756554797065202f42617365466f6e74202f515a5641524c2b48656c7665746963612d426f6c64202f466f6e7444657363726970746f720a353820302052202f456e636f64696e67202f4d6163526f6d616e456e636f64696e67202f466972737443686172203332202f4c6173744368617220313139202f576964746873205b203237380a302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020300a302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020353536203631312035353620302035353620300a30203631312032373820302030203237382038383920363131203631312030203020333839203535362033333320302035353620373738205d203e3e0a656e646f626a0a35382030206f626a0a3c3c202f54797065202f466f6e7444657363726970746f72202f466f6e744e616d65202f515a5641524c2b48656c7665746963612d426f6c64202f466c616773203332202f466f6e7442426f780a5b2d31303138202d343831203134333620313135395d202f4974616c6963416e676c652030202f417363656e7420373730202f44657363656e74202d323330202f4361704865696768740a373230202f5374656d5620313439202f5848656967687420353332202f5374656d4820313237202f417667576964746820363231202f4d617857696474682031353030202f466f6e7446696c65320a353920302052203e3e0a656e646f626a0a35392030206f626a0a3c3c202f4c656e67746820363020302052202f4c656e677468312038393438202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801c55a0b7454e5b5defb3ce69d6426c9641ec964663233993c266ff21812c810669240321012c0494c3043080d5cc0603180088d800602566cab20724badb4a578ed9d048b835c595c4b6fa996bb6cd5ab45d45ac54735a5b6516a6166ee3e67424ab25c2ed6aaab3d7ff6d9fffe9ffbfff63efb3ff39f6cb8e3ce5e48804160a1a523d8bf12c4cb7a0800033d6b83fd7139751ff1733d031b2c71997701b0bb56f67f6d6d5c963d05a0dcffb5359b27fa6bef26f9a9bedee08a783d5c235ed1470571196710b7f7adddb0292ea73613f7aeb9bd67a25e1b10ead706374dcc0f1749b6ac0baeed8db7b76e209ed37ffbd7054e97b5986edefe3b7a27da23f5675f02a4520ddc057258033260404d8934947ea0dc0f1cd50af5447997f22edc9654f32968645400f07d67e1a0c05ff99af2932b17af3995dbe4f5d44e2eb6172aa88f24379a0ba042aa7f5db96db246a8152e4d183af3c3d04ad448349b6806515efe88ccf30cee83d4ae718f1ccd1c28cdaf19fe781a0bc906ef89f710167a540920efd95163eed9b1a331778e1c9ba0924330a30fec22f78eda9f308771f6a8dd466c569c31a3952692c023afb49b2395cbcdd72ac332f4a49bff6affb6f90ad167f65af3a7f612f3afa9dd8b950de6f373a87ed4fc425e9821f6bc3dcca127c97cce7e8ff9a795b9e6a72aabcda34e2a1b358fcc2176c27ca4f21ef3e33bc592efe789ec317b180f8e9abf27b013e6c334fec33bc48a87e21db7c759ff4e71a2db8f8b6cddf130f3c409f35a7bb6793975448fd2dc655f63eeb4bbcd8be784d1316af60bdd4e989b9de7cd4dc2d4a3664f7ca28af8e8e57651e3d2f8b42efb29734e7c862ca1b527c56cb1379b4d34beeb7b0f9b5df665e63979613cfa74634e9ebdd1f9704518c7c53904468a0a6c5d9cf5389fc51f4103e4620738f091e38db9a433ee1b35ef2076f078634ea523cc7ee049361f77363a771255103988968471b1c725dd2f5d215d222d93e64b73a5d952ab34539a2e4d9525cbd4b244994aa690c9641219276364204b0dc77ee7c9173c2955a216988413ee9c985733429e6e740706650ccc87b004ee4d1ba8d5d726cfd6b8ebbd5f70eb160bbbbdf97fbff47fcfe6ebd1147ab8a92d103a666a0f950a9998a9fd86fa7f24db5b47bd9b5a371f6fddfcd1525fafcdd76df3f5127587f60cf4e94383cb2d96918f360b1596109bddbdbca74fe0c1ded0665baf37f491cd6b196915fb4dab5e2a54b7dabc23b0d4b73830b2d4d3eb1d6df5b4fa6c416ffbf1165fe3822973ed9e9cabd1f70573f984c11a85b95ac47ed3e65a2054b708732d10e65a20ccd5e26911e7cacff7ad6aab03fe0c68f8e7a080df0f26ae0e4c00b10b44af0b3cda16bbccbf088a582436c65274c32c81deba8aa9f09f2085a7611b459cdfc03194830dc6b0147e8b26cc83d7200aafc3efc1087be07b74f7c107f819459a0f3187da54c076f82e1c8ef5433fd452fa0079d042157c18db123b17fb1cea6018cea21453d0143b09453044e9201c4215b33c36027a68868d14d9b7c32fe1426c34f6071abf022ea1068bb8ead81be4603c95b861371c83a7d18a36ccc35b6397a85c4f3a76c2b1983f3640fd2e53ab2258005b68b6b7d18cd9988f07f14d762c3618fb26ad2d83ea96400fa5b5700f1c8043f0a4d86a3997c16b697c2f3451dd37e157f001fc99826e2ed6e126e615f60fec9fb86aee60ec2ce9b184e6eb86c3c8122a765c822bb01f9fc4a7f067f81953c9045937fb0ad7cf3d46ba2d815df0183c0bbf8097e00df808c6e06f10418e749a8d0b710bfe3bf5fb3d53c674315b99bdcc05e6325bc2bec949b93dfcbdfca918177b25f637d23913f2a09a9ef44510805e4a2b611ddc09df809d2885fd30023f236ddf82b750816a2cc2126cc0c5782bfe1b6e8607f1083e8317f15d7c0f3f24ed52183363638a98019a6f3bb39b799219654e3263ac86ddc06e65cfb06fb29f715aae8b3b43e92dbe80df20c99034491745bf137d2b5610db173b487649a364875c2880d9c8118a6b61275972376176088ec013f0131885d1d85574c359f835e9f5365c862b64b10c4a562cc52a6cc145a4e11a5c8bdfc003a4e1313c415a9ec253f02abe8a572945c1c0c89902e65626c86ca674100e302f89f8a8582b9bc316b04d6c5bec13f6497684fd33e7e03ab8f5dc166e983bc01de633f859fc2d7c07dfcf3fc49fe05fe0ff8fbfcc8f4b4c9221c911c9539297a432e90ce9016914b348170b3ae029384d5ef730db4fb21de6e24eb2ea52f81579ef18fc1caec2e770067e842688b28235b3638f4138b68bacf92cfc94bd1b6ae041e6dbccfc582d7b94956369ec0a8d554cf69a4c9ebcdc1c67b6c36ecbb25acc99a68c74a341af4bd3a6a6246bd44989092aa5422e934a788e65105c3e5b7db72594dd1de2b26d8d8d05826c0b5241f08682ee90858aeaa7b60959847e41aa9ad2d2432d574e6be989b7f44cb644b5a5066a0a5c169fcd123aefb559c2d8b12840f9fbbdb6764b684cccfbc5fc3e319f4079ab953a587cfa3eaf2584dd165fa87ea06fd8d7ed2d70e1490f6d068a02179c04f0805218380473835b29b8c25ca1852f64b4797d21838df254c73a7cc115a19645019f37dd6a6d2f7085706e8f6d79086c75a1a4fc89ee423f0a828ed600cd5de05a1522fd618f6a856dc59eb00796770bb9606720c406db434cb73087263fa4b37943babb2ee9ff2e5ecff9f6de5019621cf5c1dee1fa90a77b0f812e88dd8214dc4b52539b858665ee6d0f84f05e524e5042d43dbe8af836e1e85e6d09c96d75b6bee1d5dd8439b404468d1ea3cfd6ed6d0f416b60d4e031884281eba47e5bb59540395930a7608ec0abadfa6d71fefe8e78f96fce085cbfedecef8837b54ee282c2dcb679a466c8d243931016a46b9570ebad82e19e2a828fae76a455ae227de686187225d611e21df382a1c1b60935827dde09e5567b47e506a3b82fd5b553fbee61f54c3220b557db2cc39f0259d636f6f1d492e04489c4a1fe14844ac1fe932e14c2e0f5fc80b07f3a684bead3dbfa04f30d88a626d9a6f7dd5040b2b06f15d00ba7ab290cf296c008e237dbc318bb370c5ed349da60d8db965175bee070abbc341d092e1715e45929471ad4d344f5826758862dc3f3560c5bea2d7de4529c43e454d13bdc5e4480b5050816581cb0863cede993d9def6f699344ea1300e75a1e6c3ed34c2ea8911888b4545116a54e46aa25565b70416054283def490c7db4ea093139f690984ce90ffb6b753abe2494d49e3adabf4133a9790cec579545f1a1f855e6b066988f6e16161ccb680cd1a3a333c9c3e2c3c757199de90a71778260ac2203411100ee3600bf52566b3a68b905b6d5652ab5dc0b48c1cf8ba03d16bfd97235c3ea937f5ac206dcb45842bbf2284ab6e0661f74d213c7352d329085793ce3305846bfe7908cf9a82f0ec2f47b876526f52d243dad68a08cff98a10aebb1984e7de14c2de494da720ec239dbd02c2f5ff3c841ba620dcf8e508cf9bd49b949c4fdace13116efa8a106ebe1984fd3785f082494da720bc90745e2020dcf2cf4378d114845bbf1ce1b649bd49c9c5a46d9b88f092af08e1a53783f02d3785706052d32908b793ce0101e18e49843de921b8310e0f4e0bbbf09507e65ba740def9e590774d2e84b45e46ea778990dff61541de7d3390076f0af2e5939a4e81bc87745e2e40bee25f0879ef0d9003ff0b38c8b801b8af4335f70e6c21de405444f9212adf4db4476a82414126aa634db09deaeb9863a0256e94b82191de73e3e77274b806127886640bfd46a383907ff1c5d009299dd1d06f55e192d06f48e192d1ab940294625e45677882fe4974ca285c3328bd86c5f85da694b99b09312fb29bd8735c26d7c7fd91afe20ff117e8d7ec411a70169d29b034de6c8f959798e8370b2735b1a0e03913cb3246b9446a4230c8e4c7ac6b6ae84067c1788d3f52b340fd598d5f1da981da9a488d4025c5651aabc64974907b3c7ced3cffdcdf6687b9d6ab3f113461a13af62657c5dd46fab961263ce05958cd94576cc6ddc8bd9689d97f792fef7d5b62024f270229c67cfa5dc565176617e609055cba322b3dcd35d32ccd53285da5ca99297ef017ce2ccf9b9d6dac31fad30b64fe724375cd7fa101acd0883f015145ffd8f818a9e87f57e33e7fe95211d48ed59292e7dd9a649d3bd9ed46810b945f528c5dd08589988412a9449b9a56565a51e9aca8ac289f916dcb924aa456ca5b4be9d79d265597893aadb5109dd4d296955d3ea3b2a232857933bdb2d8d3e1ac5b34b3f351f6c98559b3ba3a7af33215d13179c37a4c39be670fc36664449f4f50b0d5fece0ddff9ef4797fca09f49d668e52ab5ced93a6fce9a072e2b928c9573cb4a1db50f74ee6b68f8795435637e554e429e75a6c35350fee3477fd951a2c597051c19d8127b873bc49f8164f2ca3a8f436e512626abc0604f962a15163bafd4ee648c5926b3c29ce0541aac5907ac2d0be28044c6df15001913a118abd5d0f2dd25c590ac4d656c59ce6ca7d64aa6a3b59625d3d29de2da0534d81fffe54faf0eb596b8a31f6246c51cff46c75d99ee471e9d9979f737b88ee8f39f46a3a3159696ddfc99c878734ee9b50da30f6e68de777fd3c6bde1b8be0db10bdc0cb2bb894e3cd6797c8fa41d4d638632709e3690dc97bc49b13939acfd45ca39ad4ccf4838d36f387ba6519a96a850a99f56d9539599ea8a24335464ea4c468bac4267305b86ac8d13eb11cdab7147c6c704eb8e69dc6e776d4d9c0b365d4f46cdbebe0c9d68552b99cd6a61cad55056cae99055cbacc5bdfbca3332caee5fb1588e36c5e2fba29f473fff2b267f721e797d349d3935aba4ee81e66d9be6ed5ab374fb865358f5391ab02afc211e117dba2876919b496b9390e765c1139e79f5b2a1d4fdf8888293a09c97a87963135faf9e67b90fef4d1a322bd83456979296a26b9435a735ebe6193bd33a751dc68bf83af7a1e97dcb158b7a3ed6ab77f13bd41c13c6873c650b136f4bbc3d914d4c4c97d8b3ac525db22b5d99c632596c856e4b5666b76a50c5a88c76c69cf850a6c1663f30894c443074975fe37e77ac888c4ce89c276492dd455d1132f8fa2e5cdf05e4d78568ab48d351925ae956564ace2c2064cb028d1aaa115f5c9b88a7a45b6edd75a1c193a26422699260755ba03253873665c7de6b2f469f43f3a55476c3ddabd7dff9d1ca75c1c1a6fb8fd4e596a61707571c461516623a7d4ea00be92409b865fcb3a0835a8f83679c4c20b12f914bd52583caae93aaa50a59056f34a4a89d1a83de70dadae29bf05821c8080e5b434faf869c959ed4347a06b5e4a8a2874a849c55331bcbd8b93f282f488dbe91e95cbbfecee8bb9831fbf10e6e597de3ac7bbe151964f6072a9af7ef8d8cf2cf46aedcd614f7cbdda4d831fe0531ee557bb29aa1193ba1938ef14628e448a40ab94e67048913a514f846afab24063e5faff73da8adadf58f119a5d481a88742cfa165ae3c4d1916874e3d5d3c2daf7d0eda8185f1d9e140650c10b033bd1c0f193c3fa23741e2c0e5a529c8b34ded1e83b68a24ed47f9042fd21ae834ee69e9be3874a8a0074544ff7342207d12a8af6abe97c7433f1bb88ef263e4cfc11e28f10ff31d149a2f7698f48a4f6563ae563c14c3b859dc6d48b7707c57e338d6aa2a822a3dda4882ca5a33e123aad956312f5d0801f5229974951c7044ee206288422b4d1782d74663c61b0b3eaf131f7f8f5d5d4d450ccf58fa9c734bab8f104f351d2b213f6a3787bdd94f1ac552b04200ab63a81f30fec7517aa154cf4626af6ca81025df4ed54fbaabbf27404b2b6bca86de756ff6c4b555b600dd75155ef6eab5c1d59c49c989dd3bc7cc6bcc8466677d0b57061417ba49ff31c5e62f75496b5741714d0fa055f0cd2339b462b6cf214f0a84507566240d9a79460b25a22b7d30391c829747c852e89311a3489cea4a95e7956f04a8d5b083bb4f18dd5ba273cf30bd7e264875f8d5ed4e50d3c5891417e99525912185ac5758e9c8f6431fb97162ede32a737324a2a2e76d4b1e4982cd451bc3cc4f592b574641dbf2747c7a24cb54bb54bcdea12f4492b1358deae4f952aed894abd5ec654e88c465985c660308671e0f86408108323c54471e3ab2147c53be08ef5f6f8a626ee7276b05aa07c8670d722f3d17df76ddd3a34b495298c7e1c7d9fd2c7984aa1ce80a991977e397ae4c8c8c89123a32ba34fe0923f7d8c1dd11f7ecc78c80fb7d3867495eb8414987f12586c38ce242548c2d8e031a44813242a858529663c0cab258f6712954e9521551bc615c7ad2d2baffbcbcba2e3fbbb84e789d47d5978a4d2741a0a4db4f58a4fb7e811cc1bca94f4bc84ffa8b646df46755d49cb20d78918bdc832fdb53b2257b8bad36b73e6127c64dfbad8eb74761c847c70c136cf42b95a926d4860e59c55a96c52cc533658bd96c6dc57599929cba2527069f95c9ad1e54a9672ae1ca5cb95a455584c69fe2ca9b640ea77180b5560f22715803fdf505078c3ce334ec1540c4de3e406b4f150908d031d39af3e2f3afbb2ae65d8856258157753076d45e533c8b5399d55dc95c806c2a3201c1a4b6c96ec72c41e7966f9038b7b7272a2b193cdcd63affe0a3125fa8ec450b4be6b615e5eecd892c59f5c8bc63ea583f4ce668bbbb4b4d8609855e8f30eeeffede3e72a2d33673a4bd27455398b5ab77cfffc6f8fb2e44c08dad81f984d7c1ff9fafc136a579259e5d23c83eb81c34e4f9a143a2528d193699224e39cdc09df223be9c39878dcda2d98e7e59a772335e335827dfee8175ff2c66ae915a2a438a55c78cf2bd3da34f17725ad54426bd3680fa0716424eb960453e2d0f3f38bd9b52f6071f4c5172267e65a115fe1a5fe9295cc61d2c948cfdf2df4ed4a02dff52c744a164b56487e20f9299d954b50cd3450d55dcc0676232769c05d30c4efe77fc43fcd9f63dfc72b28672d1ce74ce6790963417426d3101286a7cfd1129651c8180a8c61548db23c79a0ea046790f60aeb300c2c508febfd11b79bfe0ceaffd18b0f6d4d4db29b1f2accdfaa6e5a14b8abfdec50a17e321f7f79a05d92c23a5a535807964637465f8a6e46cf3b5cddd5d35cddb58bb40e7acf9658691d2a700b5fd5210c7c5118644440c412298a9e217fa4b775728f6728c25ecfa92672c525684d17e6508a13314368fde131cc8d9e8dbefec493d1d7a2ff8ba5c768b2cbace6ea69d678ed3dcaff39eee3c21d62c257a32fba3454c8d2372f1fd443237df96a868514a317412b7db95a0ab7403b74500ba4588f6277097dd183451d4be7b436e737f6ae19e8ddb0aa27585077fb9a1542abeb97f0ff11c2ff44f4116d22da457480e82811ad19ce11bd46f401d15fa9a38c484f94435445d4189bb8a81e26f308966972709abc7c9adc334d1631b861bcbe69f5aba6c96ba6c9e2ff8fdcd07fddb4fadba7c9774c93bf3e4d16ff1fe486f106a6d56f14e4ff07356451940a656e6473747265616d0a656e646f626a0a36302030206f626a0a353336380a656e646f626a0a31362030206f626a0a3c3c202f54797065202f466f6e74202f53756274797065202f5472756554797065202f42617365466f6e74202f554f4547524b2b48656c7665746963612d4c696768744f626c697175650a2f466f6e7444657363726970746f7220363120302052202f456e636f64696e67202f4d6163526f6d616e456e636f64696e67202f46697273744368617220313130202f4c617374436861720a313130202f576964746873205b20353536205d203e3e0a656e646f626a0a36312030206f626a0a3c3c202f54797065202f466f6e7444657363726970746f72202f466f6e744e616d65202f554f4547524b2b48656c7665746963612d4c696768744f626c69717565202f466c6167732039360a2f466f6e7442426f78205b2d343638202d333739203134393320313230365d202f4974616c6963416e676c65203135202f417363656e7420373730202f44657363656e74202d3233300a2f43617048656967687420373138202f5374656d56203638202f5848656967687420353234202f5374656d48203538202f417667576964746820363033202f4d6178576964746820313434350a2f466f6e7446696c653220363220302052203e3e0a656e646f626a0a36322030206f626a0a3c3c202f4c656e67746820363320302052202f4c656e677468312032323434202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed564b6f1b5514feeef83179b84e1cbb495ba73053e74163878424a450d2ca42b67114a4bc40ccf00a267163a3380dc52d45882a0b2a55164242ca8a75d958200d8b564e542959b244826c103f801d9bb26b6dbe3b3375eb0aa12e106c982873eef9ceebbbc7d6392e5fba9c4700dbf020b95aca6dc17ed408c589d52b65cdd11589272f6cad975cdd02bce6fac627171c5d7d011053857c6ecdd1718f72ba40c0d1c514e540a154beeae86a80b26de3e2aa6b57c7a9fb4bb9ab6e7dfc4a5ddbcc95f28e7fdb0ee5f8d6c58fcaaebe41f9ccd6a5bceb2f0cd63fdaaa7b7e82a097829b68c726545b03783385dce1a52eed422dfdf274fada4ad7cc1f38eef94de6df8dfd2eebe170bdf35e3d51bfee3bf4de66503bff9d87711ea57102f07d43fb65df21e30e5d9b23941a3ae2620f7ef4201017fbe8c53c66f12246c030f4c4f7d187b75a10ec23849516689fd15fe163bc83731874c3c2f894faec234804051b7998fa281218403fef2afbdc13c71e8ef1c2a1780ddd5afab3e2b194a45703a445f05a8ae4ea710efb3cbc6dd3386d736d23572f165b107215ece99bc860a2e9a4b8ec1f8431b78f7faa2ce45495bd8930e22c6690e239dc98429be24750d983aafc8830ad115a87308ae7718dd9cfb578d183b9127335b42f18df0bf1a559138deb35a44eeef2d3f1acbc3b5a8348685aba98b2c47b54940481119d274f42cb589ec1cc921133b58a56995dab6819ad905bb3bc83b6a4215f31c7340bcb4691efd70cdd4a9ad1e6316f9a6799c72bf33084ee1593193e703350dad0d87d3af912739ae5195a30160d6b3b15b5922933aaeb5ada3a5830ac835454374d7af99b4cc9587e280e67959cfd23b4b73959960d2b19b560562a32e7b211d3aded4a255ae13d5cbd8683c70081c781a40bb013ccc14ea46b627b81c928627a5402313da693a79962edf6c4dcb29126535d32edf8fb9677362f42df00e977da2d3ff20fb53cf8242def7aa296773799b6b43c44ceddb2e53dff61cbc3ffb7fcdffe963fda720e1ae506769404b23c3abb019c9f7e7b866e3611e0657c4d0f1fb823941bca1d8e4b3fa74f005d1cef1c4f6983afb1e82e7d3acf9b2ea0484081cf06ba77e5f6b9cbf1c453074fe3cf85f5902ef4be70480d0fabc3678677c4dd7a40dcac7f5bfda1fa45b5fa54b5aadcb99f522a8dfacfa2ce57a331da689013b92a679408a21cd0ada5da9bb555595bc543c065e790917483d223e8b053c9296c739a8c8527d5f36272a2b7afd7af7a62e1e9a1d8a9a0a20685faf9cce64c57e28de9f1b9f0119f9a9dc9768d65fb27e2a73a8341bfe2cf0e8deba7fb5fd2eadf89a54c26d43f1039fe6c94ed78b03f1bb7b803');
SELECT pg_catalog.lowrite(0, '\xfeea91fb75d136086e3eb99df9ab002781d7e7d3af2ccdc5b3f98d2bf972713537fa6a71bd509e7f7fa3f8217fbefc092e7affed0a656e6473747265616d0a656e646f626a0a36332030206f626a0a313033310a656e646f626a0a382030206f626a0a3c3c202f54797065202f466f6e74202f53756274797065202f5472756554797065202f42617365466f6e74202f465a5a4b53532b48656c7665746963612d4c69676874202f466f6e7444657363726970746f720a363420302052202f456e636f64696e67202f4d6163526f6d616e456e636f64696e67202f466972737443686172203332202f4c6173744368617220323233202f576964746873205b203237380a3020302030203020302030203020333333203333332030203636302032373820333333203237382030203535362035353620353536203535362035353620302030203020302030203237380a3020302030203020353030203020363637203636372037323220302036313120353536203020302030203020302030203833332037323220373738203020302036363720363131203535360a3020302030203631312030203020302030203020302030203020353536203631312035353620363131203535362032373820363131203535362032323220302035303020323232203833330a353536203535362036313120302033333320353030203237382035353620353030203732322035303020353030203020302030203020302030203020302030203020302030203020300a302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020300a302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020302030203020300a3338392033383920302030203020302030203020302030203020302035303020353030205d203e3e0a656e646f626a0a36342030206f626a0a3c3c202f54797065202f466f6e7444657363726970746f72202f466f6e744e616d65202f465a5a4b53532b48656c7665746963612d4c69676874202f466c616773203332202f466f6e7442426f780a5b2d343533202d333535203133343520313230365d202f4974616c6963416e676c652030202f417363656e7420373730202f44657363656e74202d323330202f4361704865696768740a373138202f5374656d56203638202f5848656967687420353234202f5374656d48203538202f417667576964746820363030202f4d617857696474682031343435202f466f6e7446696c65320a363520302052203e3e0a656e646f626a0a36352030206f626a0a3c3c202f4c656e67746820363620302052202f4c656e67746831203132353136202f46696c746572202f466c6174654465636f6465203e3e0a73747265616d0a7801ed5a79701bd7797f6f01022401820071910409025802200ee2202e8204419004291e120f510729c9562491921c5bb66acb6712474ded34969dd433718e99d4992493c3e3c9a126b1439b6eed386edaf48f54c93853b7e3a6a99db6496aa733aed3a61e13ecefdb5d602151b6d369a69dce14e0f2bdfd76f1de775fbbe76ebe759d19d979a661a513678e9d65d247ff6bc6f8274fdc76ce239f0be7318e9f3c7bea8c72fe1c63dad55337dc79523e6fc610889e5e3fb6269fb33731664f03209ff334c6ded367cedd219feb3d185fb8e1a613caf5a607717ee399637728fbb31771eeb9f1d899758cf8249ec2bfbeb337dd724e3a658928c607cfdebcaedccf57806f50be56f79f639e659f674dec56d6c0e88c311b63027007bd5c8270fd99cfec7bfd63475b0bbf621d9a9fd12d4f88bffc0e8d3f3a65f88fca70e5e18631ede3386dc20fe50f56d208db9d8c357c01d79f6d1853d6562e63c86eb0e6087f92e998951923fc69e6604b6c8c65581febc2e5b6c8d3ccc98eb0bd9741dad96ee59e36e91ef634b3b0a3b869acee676dec3d6c8dcdb3546d212bbb51ba4785d8d8c92b2076f0a19f89ac83294b3f89a99659221bccec997cdf75ed65427883b1087b12c4084c20ec35f2e4694c8eb01996672106a25923b0d7829e7a0870e5c0e3109b6203b59b04607fd94d4f420c0d4c4f1bc9bb923c06d8102bb03216b66ea759a3a06326e149a6172e8177367c8780f900f03f897b0a58affe3eba8761b5e8dc066b5a5cf923ce3fb2bac1b7efdd60e5ee272031cdd16bfb37188f7a3c93d7952ff277e144880210f662a6897aa62e6afc537b57c455cf05cf8599b50b9e29cfe9636b17b57e69c485f50bab71cf45b6bc721dfeef5bf15e2cadba6ad3f5d5d521aca3a575f013dc7e61152bbc5b5901a3048a6fe1a686e89ce7a226b0b8b2b472f17cd975b1545e7579bd9ec98bcf2cae5c7ca6ecf2aeaee22e5d0d53604c629171d603675d18d71be55596572e965c17d9ea850bb4e6f28ae8bd78fec205d705d0a19c6fb067ae00707625a0a400c009ac014e4c6ef0f38b580c83e8751140f48a5ee0b95ac6de4dd1b9e5954960ea254c9bdf9ee5861a21b8d708f40d12cb5b7e4b2c37fd262c6ffd8d586eae617a19cb2dc0d94c2c6ffb5f64b9f5ff59fe3fade5f52c87abe1afe370e0d8c37238068587d822ce4f62de47a31065411c77e048e0f0e1e895aebf8ef9a7582b8e25e187b876026394cd6ac6d83cce1734cd2c836b8b80470037636cc318c3b880318e7110633fd6b229f369f663360f7cca1897b04e09d7a77104e837c0670ed762d2fd80636ec13ead18dba4e35e7600638b74dccb1688347ce963643a7e01a3873da34024b0f44f80eb47a887d3d6313d668df0a9cdcc80dfa89f96dad484592b33236a21c49167aefbd8981d41903e4ed68ee0237f289c5cfe7121ae753337eb013e5ee663222ef7323f0bb020a26008676104297086c5589c2558f2f29fff1f381b40d0bfda27c5284b62ec00bef7b0afb357b88d47f92c7f9cff4c3824bca4096b8e682e699bb5f7687fd2e06b38d2f09ccea13baf77e83fa8dfd0ffbaf18b4d89a60f36b7353fd0fca6e1f346a371d1f89071a36577cb374d1ed323a65fb41e68fda6d9612e9b3f62fe0b4ba7e56c9bbbedeb569247036dc95f179e82a47590ae11123c06d717df607a1c6633a2eb251c746e7e020981e6759c61d68a1985dec915baea7a02cb188aab0a402080c01a24006ed6620b845ecc9a314b242d5e8b977b9d568bde1ad4077341fe7ac5c83f5ff9f2a37ffee8038f3eea7ef451e1a9adb27061bbf23cafe0dff676fff636696c6e7b8cdb8597a161ee4d20ac05badac81558b4145713496ee2769bc329c634997451c871fbf4d2bec954a8147538a3a321e1e5d3afbeff7dbf3895bffea63b774dde79f6fa2cd61ec4da8eeada5897d6afadad2382744c5adb59e499742098726bec3693a01f54968e389dd152dfd33b5626bc17917596617b0636bd8953c9a890057170b781b88b517fa94a87b217984734225b051ec832704f23eed5606cbe040a53f6945db48b193193e2d1c28b2fe28fbf4eff0b9248d9c9eddbd9d7d80af6ecdd0444030356e969247a1a49402412012271da74fa4c918f70acf7b590c7e8f0cdb8a399667f6397dbb74234f4b17fe07e2e6221bb9c236a228c1616704d1b0142c085fbb7b8582c02ca91af31697f0ded4fb28223a9f153d118697fe49bd83f9549d94fceac602bac18dc7e4dd00adf860f09b16b365818da471a1806ed7ef0c01f27acab9ae8aad3441bd165abd3440f013cb226daa07fa803a0891e49814913793a26883e9360b7b985d44051d00cb8b52456d117134875f8732d81c9c1cc44a0d5d23791ca4ff61abf9ade9df1b6e96c99233333d7646c6da96bf9e1fc9903e9cccad9a1f24df391c1951bf9a77ab2d34b074253e78f0f0d9df8bd9989f3eb324fee00636e045dcd2cbf09f6cb7a5095bb9e50d5d7e1de448026c27d53e2b2c2673153d4e4521691c71eef1b4b7a1b5325c118d6347765fab746c1f70418a8c11efdece8265cae9632fdc8264e65096c62732ddc2ae95433f8e9043f9df12a0e0db465431d0eed04689715c521f1ae01bceb93acd80afea406dce09d49ab3769f45ebbb7c873c5868cc253e7a4a7b03f9d59ca75f5a4c6cae39d164fa799f3fb2a296ef3f9177697d3eef6f0a057cc871c02ff9bf4fe116f4f7aba2f3e3d180df6da5aba7da18e6c6a6f305c88076343615f3660ed4e947aa11ea0d107fd60a071985dbf8940a021ea40237c12c20fcda013208366a4b059ccaa143a8820471d857d04e893b94c6b0fe3e60de6507cd506ebc32c29d30bfda8d26617d3d95c91cbe4ebf48a2f80d204533607295230a6d1ff6dff6cc6dd1ecab97db93e4709b9f472343c93f52453816457b37b687f76e450c1a72b1d9b0f8cc73bb8d03bb237c63f64e84987bc71b7c911ca79137bbc6e8b3d321ecd2d3a8cc178ba3dba7b48e48ed4727169b9333ad413c97b0de422c016a1115553336b615096aa66c16340c25a48983c8cb1e6613444b2a68e07f59a66040fc854f103fc48754f89a4df9be1298be475fc5e0b3f59f9133e3d74fc78a9b2c5355fcdf11f55c2d9affe94df067c24dbe7af600f3d1b57ad5fc683f0212fa6abe1a37a834d48adeaf128caa8be4123f987197808fe10bc8480dc80f117e0affdf0116736917068e02e48e221e877409a7503d6289112c07ed53816c0bafe3a9fa1a8387c3beea1701620f604649fd18e9b5b24bda79f052557950b40f4082cb2e7708a819a19087ac41d3d307d815b828e449fcbde37e4f70f056d7c44eb1ede9b4c2d0dba83830587455b9a793c7728e48cf627ba5c71d1d6191be91dd83bec7125a7c2d1d16cced739ea7e9c9ca100a566c2fda886f5906ea9aac59c50e4148f149c55162a0045c692f3a0d6055903bc2c4f7131e8d55bbd9a56eedac36d53cb958dfd37f0ce0f0b97b6122fbdc4bbf85d60da12f63c8e3d8d701e71761db9792dca7ae2ae173399cf61cc74127749bb5a6ad274116eae3adc3a09d0295b9809a818a41f75829fd806ded88559bbcc59b21c626c8467d4a9c6e295bd8ca0b7bb11d7e19d3ff695c1e5accb3d389f78eccb99e9a8d591d833f870996b470fe53b6d9e90636e462c1e4c0d35f7e4e3fd39b761a84d4c797df1ee96ad770b973a13137d819cdfae150cef9ac60a76a0015e26b65f153e0d7d0ab209b2202dd250d56bf888045f1d4daa5fdc603ee00f2b0425b2b65038e3315e1f56722993a61a52c867388545fbcd47c6ae1de9ee183a3e1bdb9d0f36ef32c6e6ae9f5ebe6dce973a74d774eee84cbc896f1f994fafdc522a9c3b3ce8ce4c47d2d74c85464edfb7e7d4838743dd43fb0725bc495643909581eddf44b490bd3cca75c8445b93c9dbe8cb26842848c9012524554ac8f8a03614982df0ebcab1c4ffaeb2ce6fa97c987f41b834547973a8f2d210f16e16387402872636f75bc3a17ee7597ea9728e9fae7c52d9f511ec398f3dff157bb6b287e47cb5f18a7cb5112420e78158c80b365fc2417904a0ad12b40590965ae4dbc1212514be8d8929011b26a6d89c81b4c4408a4ec8a7acf85a448ba8c1d7327ffa15e167a7cac22ba55705d8dabdc27bb612c207b6eea64392236a32e103921c6f81eb05a6947f930bd6004f0d321ef845d052f562948d2392d772702dedadadd35025c553f1bf2c29273fd74c3f6996d1b5024f0bbc8305187f4c28efe19f11ca0bc2b9ad0780ebfdc2ad5bc82a80400636f23c6cc40a2b415ed6070c3b70f401cb2a5e1d0a5e32a79167d430dcc1d056dabf95f6a79c8dec87720bb7a47575b985948b35d4c75ee46a99c8bef72eed7bfffe4864dfddcbcb77ef0bf3c5a9f5b11effd45a711263cfd83a3fb570e15461f8d4fd0bf3f79d2a144eddf75a66e5dce8dcedfba2d9d573a3a5732b52b92548b9f91af86e4412f1a50d16033d0d3862a0a9159c6f05e74d12e70d3823046dd29917675eba17f789988b354d321359e63a49980860223a153df112c05b0710092012601378088838147fcd122b892f266cd2fa223c0d36f2c5e15d6a6ed26287dcbc030e3bd277b7c6893f3b8a1e241f223f1d184b747527477d2f9479e7ed77e78a9edeb606ce1bf4cdfa3943538346ab73059076fcae59cc06fad26e63e59f872a4f089756d7ca8b5d8670b6d015cafaac0dfab6d2d4b8bd5b6cd3c1e622907f0ef2cfb3994df28f1016c5842466d0c55a8eb523a2a689beb42c69047850449e5294249d736b1457afa3845bcaa8c46a6c75eb4198e438cf68c5dc74283115b5074616961746023d23470a23870beeb1ee81922fbd2b6c6ed0454b7b16e786c40bef1b7cd754f0af1213616b7b28eb0ea7bd366b677432e39fca7a7cc3f3d15021d0d61d1bec12c32e0b5d48afddd83d7c7018f499a1e45dd0053d1bdb044dd4f850a95242ac6a508ac9c972053d484941990e32d2a340b37aed6453a25930feb4fc53382ec49e8f630f74e08545c9ce7755a3f90edb553c8bba95e29d5415aab75dae11ad9a948ba7345691277eb0e7d7bf5cf8d3ef2ebcf2eff3bc587996dfccafadfc80c72b9fab7c44b2e1187267876003ad13ec0fd128870e3b7190fd96a1666318c7a0f33aa9be7282acb032db60795ccbd7f4dc4f42f5b3a69a5ac70910af53eb01020cd401543d502ca140771464c5304869961f3b764ae9366a784aa794c22c13a4da822a6f8aab7ab108ad41e961b139727613622d543e4323956d39fea9c07c70728fb52764ef2d673ceb96786bab7e78aa271decd08e687af373e1e064aabb23a077b5985a5adb0cdac0f1bc6f34d1f518379b9b350de94cbbe834b4f9f3c19b8446bdde6b8a0d1b5cfdbed858c86af117fb2bff285a4d71a15123b4da3b4ce1685b2017b8a79dfce302781b816cade8517d748345c1578a3951f0d50eded9c1579bc44de2b60d50aabe9a41b1478212240c48b8c663a55a51154149ae54a62b15afaa198a5800a856bb945fb5ca154c9599593977259f6fa9563172d11b14ef7746c7c38152c225d8a293b1d0587f7ba1d0bd9e1b3e98efeaccaf8c76a493a1168137c497867daef45c32b9bfe41787172a7f295caabc9c48f6cfad65f36b3361536790ba7b9cc5b75fe36f42df4439afd22035546d4a29cf557214822572a84ac7733ad814556394855f9157652f4fab1c4efe2df37c21361eb659c3e3f1892543a951cced4e160f0d75f51456870edd64e22786c602a30b7da1f9a27f762cb22bd5159e59cb674fecee3f7018f21b84fc6c8afc3e21cbaf6a1b2443d9cf577b0f4e406c9016d988a366231d8074d4e4a74847959f526d5e9d60a9fa709349b865a3a1da53ee58b831936558ed5838155952c4ce88f5e925f8f0427bff58285e8eda0457a214088f479d8582d0124aa63b4657f29d5df983c3b9f56ede105d1816fda5fdc9e45cdae51b5ee26f6c250e436e2689296b73fd490afbe04bbf546fdbe0e403ecfd1b2c48fe0247101c70835e37f4da2071a01967540d58315ae92ea01d90751b105b8d2f4ac053d9d041547710d5d4a0e04a8d20d6e8a7b4c22c6b80121b1019a86573a50ee8f9d3f650b1af6f24d2a97544c623c3fb4c1386deecaca405de9195c1ebefe23c18984876bb07c6fd03e1b99cb798f78fc63bc33327f2f9b5b9c8471f209a390c95712efc1895c9c7e5ea12f91782721ba8235b16303a6bf9b5da1f04cd945b2915b52a78c583ab14b711c56d75eeb35ef52911c7fe144e3043498e19f195f48d766fa700934965d2d9d480c369977c62375a8214716c7b060aa676a3cdecec346ad6d60afcf981bdc56941c83558bac4b6d24025ca9f97743d0a5db7c15715d96737d828a415218961f551ec94c298825ce53e5b0410da3b026c645d27c808202335992abaae523848140ed651a8382f7d2d62c4e88e98aceb83585ad6f51866a4eb726518b84cea761d09bd2840eb952e1d35620912ac7a7f398770a6f80b758eac1c971c993d7bed6c7e6fdac54b7a7768c035321b30f09dbe8d5fe1db78b2124d1f9d8e744733ce6ebfbd315c3ed05fefe9fa3aa02fd390d7cbf01d2e76e706eb02274d38bac0253933a692983a9602786602812d38abc6ff1db587a24e2a2b7794f72dc4b9169973a4226d1297287d2777ee70a24e862a28c11251d4325de8dd934decedb2ea0bc5e9ae98bf53dfa485c7fe6520e10d750d7b2a5fe17ba7a62c5dbdb68e98abf273e807ea2bf620e8a11ecef14daaa4e80b0ba04eb44c133d139029126a5ab043cf77a4fdf5b4503ead95d240429d7a3c4b85d17141b7f58670fbeaaa648765f0f59f8087813a5bf0320012160669e7b7e4a09252bd0d07d5ea4d2ad62cb994de2a6af4f672a1b2f7d9bf9e7816fd8f4ae9df362b8f71ef35cf41bea8b319ba2440204e1dadcb7bb73b24a81229afbe54a0060b48410f07bf85dd25d9c3725f9edaba9b68e169904cd10cf6858764442359bca6e66394fa4d2549a9f054805279a800150b2c466ea9dec748805ed2a35e598fa8de70497617827b492137b0a7e4e4008f3ce46c4b56291dbabd55f592e6ef4574711e48f50e88cec6ce838399519fa1102f79479ccd2d8d1a7526e8e6fbe36657af3d9514f3b3c1ca13fce460a9dbdd220602e6cacfeb4e884fb23dd9547b6a55ec895f42a3029e097c843d5175dc0ac44d75f6b483538aacdf8631f5351a95d656d99e88075737a87b0a573328ddf4d5ec09a80a2c8018aa93fc6d909eb051ed6cc341b5333559a9e6a40714f45c4dae33dd751429e9fed509a004121e083fa3702b4a9837c84fbe24a9c1515a95a059cda6b963e0e058c05d3854400bbadb37ba7a972d3c9e884f846df099111a4ddc573e59ce9f988d44902115d7a683dc125b1cf6f94716c289a5218fbf480e02742d6ca791f3521cf92fe4bc94e9ca99929cffa24b5ff3868a8eaab42a19910a50228d1a47d41e7e3586a8f99255c993820a0b28e7855ecbe583144302c1fb295d8a4dbe43bac4af48972a5ae187873bfa2e4b97389b83f20e801f26b657b5ef2b6d7987e9ee50d97ad3a54e96d28cab1aa53d806756bf0fb3eb58184b8d075b05ddb162728cfb861622b01dd478fcbbc0a19fa1e5401d0dea8dd57734ba242da375eb39bf2325a9e7ab9c89b729ba9648e6dcf00952b756aba421620cf5970e2a567b8216bcde3453f6267accc9d903b3c9a307f75d6718699ccbe70bd2b967704f2cb66ba04bf8dc44ceecf259037e7bab7b3035b63cb7524826fb44bfb3cd3b38e0cf07ac4862fde4136cdbafb10aaae80e7676130f81e99135f9491db489324f0b46f529879282a96aa3c44c15a0f6c8d10904617ac988e8292b757ecc383480d2632f3c1fa5f4229041ae4d4f2a29d352d2cf8aa1d7d11f9f99291c3b2634dbadc60ea32034f70ff1f70c3cf8e040e5616b575ba396de369c864c5ec6db6d1decd60dd6097930f8303c0b96cc56f6639dc0df845d4db802ea6a16a1e8828ab8d23953013b7a7bea131d2a39a5ca89ea04a54ca0ec497a4a95e15f2a148cee60da979e8a580bc55dfee13e0785df6993bbc3d29d9e0cf1fd952f4fecea4e4f935e592004a24187476a4a44d9819bc25415372501406a8f9c556a538896b1471e19fbde84a0ab94f9535b6fc08f70383e267c076bb7e099b5b2f68e5c6287488d14be8c752966bd48a500571fe6fdd614f562f1253478e543238f947e47b865fad3850fde31b1c81fdf7a837fa3b207584de1ed47c209bd1afef7c0c9c0aeecd5a8e4ed882d0ad652092ba150dfabc9e9456b30e594928d373f3bf367df9afd838feede7c76fa273fe1c637befffd372af4c2116bdb4ef397b02fbd36aaf0e29d49b7122fac4cf58a8a2395005628323da38022cb769b933b46a4108160d9d8d1d2e1b19b9abe37f1c52f8e7dbbcdebefef31771b3f2c683dfd498bd05c99e07f5ce1c9f95c3754193eff00ff179e957232273b8a6a44d166bda4cdedd06223b4d8082db6d669b1221ab52452b418007a6820482d44f9c105951af470da41650e1eb4a2c3235537c1baf9abf24b0a9f900761bdf6b2c26db51964a8813e31fe0da98eeb429be5576a2da77630afacea50d162f36a7ceac6dc05845cb51cf79dabbd1e92454f5d0f78872aeff0b5ca533255b176e46a6a8d2c3fa90161701e6f55206eb01ec8bc5b92f95b958a1c8ec00a8fd6b25057321e3f5ee0ed05cdf8f8d50ac74a5449cea5d84fbcbda8f0f6fb1bac1b7a40cf03886354e708d0003c9705926ac58c3b8016c59faa66bf333715d6a89af3cedcfc6f32efadab6b62d955d8f516bc92727ee448b097b8622fa80ec95ef4e08d9cc192bdc8fd1272652a5f7694303bd27bc5b1a87c51a896009415364a1d69b96980de59dd2b3efaba398f5f6e4a876a06749929c142a5cff663e8e95eed9305106f15800813bc39bd07486f70d37b7f4ee8a10f6506bdc7476ff1d17b7bf41e5c96e5f0be45994db22978d869bcdd3d8bfc69376acf053c9759c25beccb6c3fde873b8898b08ab7cb0fe345f46fe23dc56fb3c72404c843d3db0a0c11096fb34d1d3a34b7bc1c995ebfe1b6f573d79d38d6bffbba53a7cffd2765453a800a656e6473747265616d0a656e646f626a0a36362030206f626a0a363531320a656e646f626a0a36372030206f626a0a2850726f706f73616c20526576696577290a656e646f626a0a36382030206f626a0a286d61634f532056657273696f6e2031302e3134205c284275696c64203138413339315c292051756172747a20504446436f6e74657874290a656e646f626a0a36392030206f626a0a2848616e6e6573205065747269290a656e646f626a0a37302030206f626a0a28290a656e646f626a0a37312030206f626a0a284b65796e6f7465290a656e646f626a0a37322030206f626a0a28443a32303139303731363039323035315a303027303027290a656e646f626a0a37332030206f626a0a28290a656e646f626a0a37342030206f626a0a5b202829205d0a656e646f626a0a312030206f626a0a3c3c202f5469746c6520363720302052202f417574686f7220363920302052202f5375626a65637420373020302052202f50726f647563657220363820302052202f43726561746f720a373120302052202f4372656174696f6e4461746520373220302052202f4d6f644461746520373220302052202f4b6579776f72647320373320302052202f4141504c3a4b6579776f7264730a373420302052203e3e0a656e646f626a0a787265660a302037350a303030303030303030302036353533352066200a30303030303839383235203030303030206e200a30303030303031343236203030303030206e200a30303030303734313138203030303030206e200a30303030303030303232203030303030206e200a30303030303031343036203030303030206e200a30303030303031353330203030303030206e200a30303030303330313633203030303030206e200a30303030303832303131203030303030206e200a30303030303132363931203030303030206e200a30303030303138373831203030303030206e200a30303030303037323735203030303030206e200a30303030303132363730203030303030206e200a30303030303138383032203030303030206e200a30303030303234373334203030303030206e200a30303030303734323933203030303030206e200a30303030303830343135203030303030206e200a30303030303031373337203030303030206e200a30303030303037323534203030303030206e200a30303030303333353036203030303030206e200a30303030303235303639203030303030206e200a30303030303235333537203030303030206e200a30303030303336383530203030303030206e200a30303030303237313233203030303030206e200a30303030303237343038203030303030206e200a30303030303430313934203030303030206e200a30303030303234373535203030303030206e200a30303030303235303439203030303030206e200a30303030303235333736203030303030206e200a30303030303237313032203030303030206e200a30303030303237343237203030303030206e200a30303030303330313432203030303030206e200a30303030303330313939203030303030206e200a30303030303333343835203030303030206e200a30303030303333353433203030303030206e200a30303030303336383239203030303030206e200a30303030303336383837203030303030206e200a30303030303430313733203030303030206e200a30303030303533383532203030303030206e200a30303030303430323331203030303030206e200a30303030303533383330203030303030206e200a30303030303533393539203030303030206e200a30303030303638333333203030303030206e200a30303030303534313139203030303030206e200a30303030303638333131203030303030206e200a30303030303638343430203030303030206e200a30303030303732313034203030303030206e200a30303030303638363132203030303030206e200a30303030303732303833203030303030206e200a30303030303732393235203030303030206e200a30303030303732313431203030303030206e200a30303030303732393035203030303030206e200a30303030303733303332203030303030206e200a30303030303733383632203030303030206e200a30303030303733323136203030303030206e200a30303030303733383432203030303030206e200a30303030303733393639203030303030206e200a30303030303734323239203030303030206e200a30303030303734363738203030303030206e200a30303030303734393336203030303030206e200a30303030303830333934203030303030206e200a30303030303830363035203030303030206e200a30303030303830383639203030303030206e200a30303030303831393930203030303030206e200a30303030303832363738203030303030206e200a30303030303832393334203030303030206e200a30303030303839353337203030303030206e200a30303030303839353538203030303030206e200a30303030303839353932203030303030206e200a30303030303839363635203030303030206e200a30303030303839363936203030303030206e200a30303030303839373135203030303030206e200a30303030303839373431203030303030206e200a30303030303839373833203030303030206e200a30303030303839383032203030303030206e200a747261696c65720a3c3c202f53697a65203735202f526f6f7420353720302052202f496e666f203120302052202f4944205b203c64346530383363376565636662663133666362643133306330396337393662313e0a3c64346530383363376565636662663133666362643133306330396337393662313e205d203e3e0a7374617274787265660a39303030300a2525454f460a');
SELECT pg_catalog.lo_close(0);

COMMIT;

--
-- Name: call call_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_pkey PRIMARY KEY (call_id);


--
-- Name: files files_oid_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_oid_key UNIQUE (oid);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (file_id);


--
-- Name: pagetext pagetext_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.pagetext
    ADD CONSTRAINT pagetext_pkey PRIMARY KEY (pagetext_id);


--
-- Name: reviews prop_user_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT prop_user_pkey PRIMARY KEY (proposal_id, user_id);


--
-- Name: proposal_answers proposal_answers_answer_id_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers
    ADD CONSTRAINT proposal_answers_answer_id_key UNIQUE (answer_id);


--
-- Name: proposal_answers proposal_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers
    ADD CONSTRAINT proposal_answers_pkey PRIMARY KEY (proposal_id, proposal_question_id);


--
-- Name: proposal_question_datatypes proposal_question_datatypes_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_question_datatypes
    ADD CONSTRAINT proposal_question_datatypes_pkey PRIMARY KEY (proposal_question_datatype_id);


--
-- Name: proposal_question_dependencies proposal_question_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_question_dependencies
    ADD CONSTRAINT proposal_question_dependencies_pkey PRIMARY KEY (proposal_question_id, proposal_question_dependency);


--
-- Name: proposal_questions proposal_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_questions
    ADD CONSTRAINT proposal_questions_pkey PRIMARY KEY (proposal_question_id);


--
-- Name: proposal_topics proposal_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_topics
    ADD CONSTRAINT proposal_topics_pkey PRIMARY KEY (topic_id);


--
-- Name: proposal_user proposal_user_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_user
    ADD CONSTRAINT proposal_user_pkey PRIMARY KEY (proposal_id, user_id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (proposal_id);


--
-- Name: role_user role_user_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_id, user_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users set_timestamp; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: proposals set_timestamp; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: proposal_questions set_timestamp; Type: TRIGGER; Schema: public; Owner: duouser
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.proposal_questions FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();


--
-- Name: proposal_answers_files proposal_answers_files_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers_files
    ADD CONSTRAINT proposal_answers_files_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.proposal_answers(answer_id);


--
-- Name: proposal_answers_files proposal_answers_files_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers_files
    ADD CONSTRAINT proposal_answers_files_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(file_id);


--
-- Name: proposal_answers proposal_answers_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers
    ADD CONSTRAINT proposal_answers_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(proposal_id);


--
-- Name: proposal_answers proposal_answers_proposal_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_answers
    ADD CONSTRAINT proposal_answers_proposal_question_id_fkey FOREIGN KEY (proposal_question_id) REFERENCES public.proposal_questions(proposal_question_id);


--
-- Name: proposal_question_dependencies proposal_question_dependencie_proposal_question_dependency_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_question_dependencies
    ADD CONSTRAINT proposal_question_dependencie_proposal_question_dependency_fkey FOREIGN KEY (proposal_question_dependency) REFERENCES public.proposal_questions(proposal_question_id) ON DELETE CASCADE;


--
-- Name: proposal_question_dependencies proposal_question_dependencies_proposal_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_question_dependencies
    ADD CONSTRAINT proposal_question_dependencies_proposal_question_id_fkey FOREIGN KEY (proposal_question_id) REFERENCES public.proposal_questions(proposal_question_id) ON DELETE CASCADE;


--
-- Name: proposal_questions proposal_questions_data_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_questions
    ADD CONSTRAINT proposal_questions_data_type_fkey FOREIGN KEY (data_type) REFERENCES public.proposal_question_datatypes(proposal_question_datatype_id);


--
-- Name: proposal_questions proposal_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_questions
    ADD CONSTRAINT proposal_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.proposal_topics(topic_id);


--
-- Name: proposal_user proposal_user_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_user
    ADD CONSTRAINT proposal_user_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(proposal_id) ON UPDATE CASCADE;


--
-- Name: proposal_user proposal_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposal_user
    ADD CONSTRAINT proposal_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: proposals proposals_proposer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES public.users(user_id);


--
-- Name: reviews reviews_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(proposal_id) ON UPDATE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: role_user role_user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE;


--
-- Name: role_user role_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: duouser
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

