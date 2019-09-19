drop table IF EXISTS users;
drop table IF EXISTS proposals;
drop table IF EXISTS proposal_questions;
drop table IF EXISTS proposal_answers;
drop table IF EXISTS proposal_answers_files;
drop table IF EXISTS proposal_question_datatypes;
drop table IF EXISTS proposal_question_dependencies;
drop table IF EXISTS proposal_users;
drop table IF EXISTS roles;
drop table IF EXISTS role_users;
drop table IF EXISTS reviews;
drop table IF EXISTS proposal_topics;
drop table IF EXISTS files;


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
, gender      varchar(12) NOT NULL
, nationality varchar(30) NOT NULL
, birthdate   DATE NOT NULL
, organisation varchar(50) NOT NULL
, department varchar(60) NOT NULL
, organisation_address varchar(100) NOT NULL
, position  varchar(30) NOT NULL
, email     varchar(30) UNIQUE
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
, title    varchar(20)
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
, is_enabled BOOLEAN DEFAULT TRUE
, sort_order INT NOT NULL
);

CREATE TABLE proposal_questions (
  proposal_question_id  VARCHAR(64) PRIMARY KEY   /* f.x.links_with_industry */
, data_type             VARCHAR(64) NOT NULL REFERENCES proposal_question_datatypes(proposal_question_datatype_id)
, question              VARCHAR(256) NOT NULL
, topic                 int DEFAULT NULL REFERENCES proposal_topics(topic_id)              /* f.x. { "min":2, "max":50 } */
, config                VARCHAR(512) DEFAULT NULL              /* f.x. { "min":2, "max":50 } */
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
  proposal_question_id          VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
, proposal_question_dependency  VARCHAR(64) NOT NULL REFERENCES proposal_questions(proposal_question_id)
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
                  user_title, 
                  firstname, 
                  middlename, 
                  lastname, 
                  username, 
                  password,
                  preferredname,
                  orcid,
                  gender,
                  nationality,
                  birthdate,
                  organisation,
                  department,
                  organisation_address,
                  position,
                  email,
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
                  null,
                  '581459604',
                  'male',
                  'Norwegian',
                  '2000-04-02',
                  'Roberts, Reilly and Gutkowski',
                  'IT deparment',
                  'Estonia, New Gabriella, 4056 Cronin Motorway',
                  'Strategist',
                  'Javon4@hotmail.com',
                  '(288) 431-1443',
                  '(370) 386-8976'
                  );

INSERT INTO role_user (role_id, user_id) VALUES (1, 1);



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


INSERT INTO users (
                  user_title, 
                  firstname, 
                  middlename, 
                  lastname, 
                  username, 
                  password,
                  preferredname,
                  orcid,
                  gender,
                  nationality,
                  birthdate,
                  organisation,
                  department,
                  organisation_address,
                  position,
                  email,
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
                'Rhiannon',
                '878321897',
                'male',
                'French',
                '1981-08-05',
                'Pfannerstill and Sons',
                'IT department',
                'Congo, Alleneville, 35823 Mueller Glens',
                'Liaison',
                'Aaron_Harris49@gmail.com',
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
                  gender,
                  nationality,
                  birthdate,
                  organisation,
                  department,
                  organisation_address,
                  position,
                  email,
                  telephone,
                  telephone_alt
                  ) 
VALUES (
                'Mr.', 
                'Nils', 
                'Adam',
                'Nilsson', 
                'testreviewer', 
                '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                'Rhiannon',
                '878321897',
                'male',
                'French',
                '1981-08-05',
                'Pfannerstill and Sons',
                'IT department',
                'Congo, Alleneville, 35823 Mueller Glens',
                'Liaison',
                'nils@ess.se',
                '711-316-5728',
                '1-359-864-3489 x7390'
                );

INSERT INTO role_user (role_id, user_id) VALUES (3, 3);


INSERT INTO proposal_topics(topic_title, sort_order) VALUES ('General information',1);
INSERT INTO proposal_topics(topic_title, sort_order) VALUES ('Crystallization',2);
INSERT INTO proposal_topics(topic_title, sort_order) VALUES ('Biological deuteration',3);
INSERT INTO proposal_topics(topic_title, sort_order) VALUES ('Chemical deuteration',4);

INSERT INTO proposal_question_datatypes VALUES ('TEXT_INPUT');
INSERT INTO proposal_question_datatypes VALUES ('SELECTION_FROM_OPTIONS');
INSERT INTO proposal_question_datatypes VALUES ('BOOLEAN');
INSERT INTO proposal_question_datatypes VALUES ('DATE');
INSERT INTO proposal_question_datatypes VALUES ('FILE_UPLOAD');

INSERT INTO proposal_questions VALUES('has_links_with_industry','SELECTION_FROM_OPTIONS','Links with industry?',1,'{"required":true, "options":["yes", "no"], "variant":"radio"}');
INSERT INTO proposal_questions VALUES('links_with_industry','TEXT_INPUT','If yes, please describe:',1,'{"placeholder":"Please specify links with industry"}');
INSERT INTO proposal_questions VALUES('is_student_proposal','SELECTION_FROM_OPTIONS','Are any of the co-proposers students?',1,'{"required":true, "options":["yes", "no"], "variant":"radio"}');
INSERT INTO proposal_questions VALUES('is_towards_degree','SELECTION_FROM_OPTIONS','Does the proposal work towards a students degree?',1,'{"required":true, "options":["yes", "no"], "variant":"radio"}');
INSERT INTO proposal_questions VALUES('final_delivery_date','DATE','Final delivery date',1,'{"min":"now"}');
INSERT INTO proposal_questions VALUES('final_delivery_date_motivation','TEXT_INPUT','Please motivate the chosen date',1,'{"min":10, "multiline":true, "max":500}');
INSERT INTO proposal_questions VALUES('has_crystallization','BOOLEAN','Check box to select crystallization',2,'{"variant":"checkbox"}');
INSERT INTO proposal_questions VALUES('crystallization_molecule_name','TEXT_INPUT','Name of molecule to be crystallized',2,'{"min":2, "max":40}');
INSERT INTO proposal_questions VALUES('amino_seq','TEXT_INPUT','FASTA sequence or Uniprot number:',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('molecular_weight','TEXT_INPUT','Molecular weight(kDA):',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('oligomerization_state','TEXT_INPUT','Oligomerization state:',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('pdb_id','TEXT_INPUT','PDB ID of crystal structure',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('doi_or_alike','TEXT_INPUT','If the reference is publicly available, please provide the DOI or an accessible link:',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('reference_file','FILE_UPLOAD','If the reference is not publicly available, please upload a copy.',2,'{ "max_files":3}');
INSERT INTO proposal_questions VALUES('crystallization_cofactors_ligands','TEXT_INPUT','Does the protein have any co-factors or ligands required for crystallization? Specify:',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('prec_composition','TEXT_INPUT','Known crystallization precipitant composition:',2,'{"min":2, "max":200,"small_label":"(inc.buffer, salt, additives, pH)"}');
INSERT INTO proposal_questions VALUES('crystallization_experience','TEXT_INPUT','What crystallization method, volume, and temperature have you used in the past?',2,'{ "multiline":true,"min":2, "max":500,"small_label":"(e.g. vapour diffusion, 10 µL drops, room temperature)"}');
INSERT INTO proposal_questions VALUES('crystallization_time','TEXT_INPUT','How long do your crystals take to appear?',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('crystal_size','TEXT_INPUT','What is the typical size of your crystal?',2,'{"min":2, "max":200,"small_label":"( µm x µm x µm )"}');
INSERT INTO proposal_questions VALUES('protein_details_lbl','TEXT_INPUT','Details from protein preparation',2,'{"disabled":true}');
INSERT INTO proposal_questions VALUES('typical_yield','TEXT_INPUT','Typical yield:',2,'{"min":2, "max":200, "small_label":"(mg per liter of culture)"}');
INSERT INTO proposal_questions VALUES('storage_conditions','TEXT_INPUT','Storage conditions:',2,'{"min":2, "max":200,"small_label":"(e.g. stable at 4 °C or frozen at -20 °C)"}');
INSERT INTO proposal_questions VALUES('stability','TEXT_INPUT','Stability:',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('protein_buffer','TEXT_INPUT','What buffer is your protein in?',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('is_deuterated','TEXT_INPUT','Is your protein partially or fully deuterated?',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('protein_concentration','TEXT_INPUT','What protein concentration do you usually use for crystallization?',2,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('slide_select_deuteration','BOOLEAN','slide to select deuteration type',3,'{"variant":"slider"}');
INSERT INTO proposal_questions VALUES('is_biomass','BOOLEAN','Biomass (E. coli)',3,'{"variant":"checkbox"}');
INSERT INTO proposal_questions VALUES('will_provide_organism','BOOLEAN','Will user provide the organism for us to grow under deuterated conditions?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('organism_name','TEXT_INPUT','What is the organism',3,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('reference_pdf','FILE_UPLOAD','Please attach a reference or protocol of culture conditions and media composition',3,'{"small_label":"Accepted formats: PDF", "file_type":"pdf"}');
INSERT INTO proposal_questions VALUES('material_amount','TEXT_INPUT','How much material do you need',3,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('material_condition','TEXT_INPUT','Indicate wet or dry mass',3,'{"min":2, "max":5}');
INSERT INTO proposal_questions VALUES('amount_justification','TEXT_INPUT','Justify amount',3,'{"min":10, "max":500, "multiline":true}');
INSERT INTO proposal_questions VALUES('rq_deuteration_level','SELECTION_FROM_OPTIONS','Level of deuteration required',3,'{"variant":"dropdown","options":["Partial (65-80% with unlabeled carbon source)", "Full (~99% with labeled carbon source)"]}');
INSERT INTO proposal_questions VALUES('d_level_justification','TEXT_INPUT','Justify level of D incorporation',3,'{"min":10, "max":500, "multiline":true}');
INSERT INTO proposal_questions VALUES('recombinant_protein','BOOLEAN','Recombinant protein (E. coli)',3,'{"variant":"slider"}');
INSERT INTO proposal_questions VALUES('molecule_name_for_deuteration','TEXT_INPUT','Name of molecule to be deuterated:',3,'{"small_label":"(e.g. superoxide dismutase)"}');
INSERT INTO proposal_questions VALUES('bio_deu_fasta','TEXT_INPUT','FASTA sequence or Uniprot number',3,'{}');
INSERT INTO proposal_questions VALUES('bio_deu_molecular_weight','TEXT_INPUT','Molecular weight (kDA)',3,'{}');
INSERT INTO proposal_questions VALUES('bio_deu_oligomerization_state','TEXT_INPUT','Oligomerization state',3,'{ "small_label":"(e.g. homodimer, tetramer etc.)"}');
INSERT INTO proposal_questions VALUES('bio_deu_cofactors_ligands','TEXT_INPUT','Does the protein have any co-factors or ligands required for expression? Specify:',3,'{ "multiline":true}');
INSERT INTO proposal_questions VALUES('bio_deu_origin','TEXT_INPUT','Origin of molecules:',3,'{ "small_label":"(e.g. human, E. coli, S. cerevisiae)"}');
INSERT INTO proposal_questions VALUES('bio_deu_plasmid_provided','SELECTION_FROM_OPTIONS','Will you provide an expression plasmid?',3,'{"variant":"radio", "options":["yes", "no"], "TEXT_INPUT":"If you choose no, we will design & order a plasmid commercially"}');
INSERT INTO proposal_questions VALUES('bio_deu_material_amount','TEXT_INPUT','How much material do you need?',3,'{}');
INSERT INTO proposal_questions VALUES('bio_deu_material_amount_justification','TEXT_INPUT','Justify amount:',3,'{}');
INSERT INTO proposal_questions VALUES('bio_deu_d_lvl_req','SELECTION_FROM_OPTIONS','Level of deuteration required:',3,'{"variant":"radio","options":["Full (~99% with labeled carbon source)", "Partial (65-80% with unlabeled carbon source)", "Partial (25-30% H/D exchange)"]}');
INSERT INTO proposal_questions VALUES('bio_deu_d_lvl_req_justification','TEXT_INPUT','Justify level of D incorporation:',3,'{}');
INSERT INTO proposal_questions VALUES('bio_deu_purification_need','SELECTION_FROM_OPTIONS','Will you need DEMAX to purify the protein from deuterated biomass?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('bio_deu_has_expressed','SELECTION_FROM_OPTIONS','Has expression been done for the unlabeled protein?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('bio_deu_typical_yield','TEXT_INPUT','Typical yield:',3,'{}');
INSERT INTO proposal_questions VALUES('bio_deu_purification_done','SELECTION_FROM_OPTIONS','Have you been able to purify the unlabeled protein?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('bio_deu_has_deuteration_experience','SELECTION_FROM_OPTIONS','Have you tried to deuterate the protein yourself, even in small scale?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('yeast_derived_lipid_amnt','BOOLEAN','Yeast-derived total lipid extract (P. pastoris)',3,'{}');
INSERT INTO proposal_questions VALUES('yeast_derived_material_amount','TEXT_INPUT','How much material do you need?',3,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('yeast_derived_material_amount_justification','TEXT_INPUT','Justify amount',3,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('yeast_derived_d_lvl_req','SELECTION_FROM_OPTIONS','Level of deuteration required:',3,'{"  ":"radio","options":["Full (~99% with labeled carbon source)", "Partial (65-80% with unlabeled carbon source)", "Partial (25-30% H/D exchange)"]}');
INSERT INTO proposal_questions VALUES('yeast_derived_d_lvl_req_justification','TEXT_INPUT','Justify level of D incorporation:',3,'{"min":2, "max":200}');
INSERT INTO proposal_questions VALUES('bio_deu_other','BOOLEAN','Other',3,'{"variant":"slider"}');
INSERT INTO proposal_questions VALUES('bio_deu_other_desc','TEXT_INPUT','For requests that do not fit any of options above',3,'{"min":10, "max":500, "multiline":true}');
INSERT INTO proposal_questions VALUES('biosafety_containment_level','SELECTION_FROM_OPTIONS','Which biosafety containment level is required to work with your sample?',3,'{"variant":"radio", "options":["L1", "L2"]}');
INSERT INTO proposal_questions VALUES('biosafety_has_risks','SELECTION_FROM_OPTIONS','Is your organism a live virus,3, toxin-producing, or pose ay risk to human health and/or the environment?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_recombinant','SELECTION_FROM_OPTIONS','Is the protein recombinant?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_toxin','SELECTION_FROM_OPTIONS','Is the sample a toxin?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_virulence','SELECTION_FROM_OPTIONS','Is the sample a virulence factor?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_prion','SELECTION_FROM_OPTIONS','Is the sample a prion protein?',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_has_hazard_ligand','SELECTION_FROM_OPTIONS','Does the sample have a hazardous ligand (e.g. heavy metal, toxic molecule etc.)?', 3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_organism_active','TEXT_INPUT','If the sample is a a bacteria or virus, specificy whether it is inactive/active:',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_explanation','TEXT_INPUT','If you answered "yes" to any of the above, please explan:',3,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_enabled','BOOLEAN','Check box to select chemical deuteration',4,'{}');
INSERT INTO proposal_questions VALUES('chem_deu_molecule_name','TEXT_INPUT','Molecule/s to be deuterated (name):',4,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_amount','TEXT_INPUT','Amount of material required (mass):',4,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_amount_justification','TEXT_INPUT','Justify amount',4,'{"variant":"radio", "options":["yes", "no"], "multiline":true}');
INSERT INTO proposal_questions VALUES('chem_deu_d_percentage','TEXT_INPUT','indicate percentage and location of deuteration',4,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_structure_justification','TEXT_INPUT','Justify level of deuteration',4,'{"variant":"radio", "options":["yes", "no"], "multiline":true}');
INSERT INTO proposal_questions VALUES('chem_deu_chem_structure','FILE_UPLOAD','Attach chemical structure',4,'{}');
INSERT INTO proposal_questions VALUES('chem_deu_prep_source','SELECTION_FROM_OPTIONS','Has this molecule (or an unlabeled/isotopic analogue) been prepared by yourself or others?',4,'{"variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_protocol','FILE_UPLOAD','If yes, please provide a protocol (attach a reference PDF if published)',4,'{ "file_type":"pdf"}');

INSERT INTO proposal_question_dependencies VALUES('links_with_industry', 'has_links_with_industry', '{ "condition": "equals", "params":"yes"}');
INSERT INTO proposal_question_dependencies VALUES('crystallization_molecule_name', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('amino_seq', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('molecular_weight', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('oligomerization_state', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('pdb_id', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('doi_or_alike', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('reference_file', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_cofactors_ligands', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('prec_composition', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_experience', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_time', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('crystal_size', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('protein_details_lbl', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('typical_yield', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('storage_conditions', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('stability', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('protein_buffer', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('is_deuterated', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('protein_concentration', 'has_crystallization', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('is_biomass', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('will_provide_organism', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('organism_name', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('reference_pdf', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('material_amount', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('material_condition', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('amount_justification', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('rq_deuteration_level', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('d_level_justification', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('molecule_name_for_deuteration', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_fasta', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_molecular_weight', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_oligomerization_state', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_cofactors_ligands', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_origin', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_plasmid_provided', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_material_amount', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_material_amount_justification', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_d_lvl_req', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_d_lvl_req_justification', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_purification_need', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_has_expressed', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_typical_yield', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_purification_done', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_has_deuteration_experience', 'recombinant_protein', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_material_amount', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_material_amount_justification', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_d_lvl_req', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_d_lvl_req_justification', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_other_desc', 'bio_deu_other', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_containment_level', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_has_risks', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_recombinant', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_toxin', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_virulence', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_prion', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_has_hazard_ligand', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_organism_active', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_explanation', 'slide_select_deuteration', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_molecule_name', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_amount', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_amount_justification', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_d_percentage', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_structure_justification', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_chem_structure', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_prep_source', 'chem_deu_enabled', '{ "condition": "equals", "params":true }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_protocol', 'chem_deu_prep_source', '{ "condition": "equals", "params":"yes" }');




