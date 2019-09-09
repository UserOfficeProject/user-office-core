drop table IF EXISTS users;
drop table IF EXISTS proposals;
drop table IF EXISTS proposal_questions;
drop table IF EXISTS proposal_answers;
drop table IF EXISTS proposal_question_datatypes;
drop table IF EXISTS proposal_question_dependencies;
drop table IF EXISTS proposal_users;
drop table IF EXISTS roles;
drop table IF EXISTS role_users;
drop table IF EXISTS reviews;


CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TABLE proposal_questions (
  proposal_question_id  VARCHAR(64) PRIMARY KEY   /* f.x.links_with_industry */
, data_type             VARCHAR(64) NOT NULL REFERENCES proposal_question_datatypes(proposal_question_datatype_id)
, question              VARCHAR(256) NOT NULL
, config                VARCHAR(512) DEFAULT NULL              /* f.x. { "min":2, "max":50 } */
, created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
, updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON proposal_questions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE proposal_answers (
  proposal_id           INTEGER NOT NULL REFERENCES proposals(proposal_id)
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


INSERT INTO proposal_question_datatypes VALUES ('SMALL_TEXT');
INSERT INTO proposal_question_datatypes VALUES ('LARGE_TEXT');
INSERT INTO proposal_question_datatypes VALUES ('SELECTION_FROM_OPTIONS');
INSERT INTO proposal_question_datatypes VALUES ('BOOLEAN');
INSERT INTO proposal_question_datatypes VALUES ('DATE');
INSERT INTO proposal_question_datatypes VALUES ('FILE_UPLOAD');

INSERT INTO proposal_questions VALUES('proposal_title','SMALL_TEXT','Proposal title','{"topic":"general-information","required":true, "min":10, "max":500}');
INSERT INTO proposal_questions VALUES('brief_summary','LARGE_TEXT','Brief summary','{"topic":"general-information","required":true, "min":10, "max":500}');
INSERT INTO proposal_questions VALUES('has_links_with_industry','SELECTION_FROM_OPTIONS','Links with industry?','{"topic":"general-information","reqruired":true, "options":["yes", "no"], "variant":"radio"}');
INSERT INTO proposal_questions VALUES('links_with_industry','SMALL_TEXT','','{"topic":"general-information","placeholder":"Please specify links with industry"}');
INSERT INTO proposal_questions VALUES('is_student_proposal','SELECTION_FROM_OPTIONS','Are any of the co-proposers students?','{"topic":"general-information","reqruired":true, "options":["yes", "no"], "variant":"radio"}');
INSERT INTO proposal_questions VALUES('is_towards_degree','SELECTION_FROM_OPTIONS','Does the proposal work towards a students degree?','{"topic":"general-information","reqruired":true, "options":["yes", "no"], "variant":"radio"}');
INSERT INTO proposal_questions VALUES('final_delivery_date','DATE','Final delivery date','{"topic":"general-information","min":"now"}');
INSERT INTO proposal_questions VALUES('final_delivery_date_motivation','LARGE_TEXT','Please motivate the chosen date','{"topic":"general-information","min":10, "max":500}');
INSERT INTO proposal_questions VALUES('has_crystallization','BOOLEAN','Check box to select crystallization','{"topic":"crystallization","variant":"checkbox"}');
INSERT INTO proposal_questions VALUES('crystallization_molecule_name','SMALL_TEXT','Name of molecule to be crystallized','{"topic":"crystallization","min":2, "max":40}');
INSERT INTO proposal_questions VALUES('amino_seq','SMALL_TEXT','FASTA sequence or Uniprot number:','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('molecular_weight','SMALL_TEXT','Molecular weight(kDA):','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('oligomerization_state','SMALL_TEXT','Oligomerization state:','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('pdb_id','SMALL_TEXT','PDB ID of crystal structure','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('doi_or_alike','SMALL_TEXT','If the reference is publicly available, please provide the DOI or an accessible link:','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('reference_file','FILE_UPLOAD','If the reference is not publicly available, please upload a copy.','{"topic":"crystallization"}');
INSERT INTO proposal_questions VALUES('crystallization_cofactors_ligands','SMALL_TEXT','Does the protein have any co-factors or ligands required for crystallization? Specify:','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('prec_composition','SMALL_TEXT','Known crystallization precipitant composition:','{"topic":"crystallization","min":2, "max":200,"small_label":"(inc.buffer, salt, additives, pH)"}');
INSERT INTO proposal_questions VALUES('crystallization_experience','LARGE_TEXT','What crystallization method, volume, and temperature have you used in the past?','{"topic":"crystallization","min":2, "max":500,"small_label":"(e.g. vapour diffusion, 10 µL drops, room temperature)"}');
INSERT INTO proposal_questions VALUES('crystallization_time','SMALL_TEXT','How long do your crystals take to appear?','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('crystal_size','SMALL_TEXT','What is the typical size of your crystal?','{"topic":"crystallization","min":2, "max":200,"small_label":"( µm x µm x µm )"}');
INSERT INTO proposal_questions VALUES('protein_details_lbl','SMALL_TEXT','Details from protein preparation','{"topic":"crystallization","disabled":true}');
INSERT INTO proposal_questions VALUES('typical_yield','SMALL_TEXT','Typical yield:','{"topic":"crystallization","min":2, "max":200, "small_label":"(mg per liter of culture)"}');
INSERT INTO proposal_questions VALUES('storage_conditions','SMALL_TEXT','Storage conditions:','{"topic":"crystallization","min":2, "max":200,"small_label":"(e.g. stable at 4 °C or frozen at -20 °C)"}');
INSERT INTO proposal_questions VALUES('stability','SMALL_TEXT','Stability:','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('protein_buffer','SMALL_TEXT','What buffer is your protein in?','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('is_deuterated','SMALL_TEXT','Is your protein partially or fully deuterated?','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('protein_concentration','SMALL_TEXT','What protein concentration do you usually use for crystallization?','{"topic":"crystallization","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('slide_select_deuteration','BOOLEAN','slide to select deuteration type','{"topic":"biological-deuteration","variant":"slider"}');
INSERT INTO proposal_questions VALUES('is_biomass','BOOLEAN','Biomass (E. coli)','{"topic":"biological-deuteration","variant":"checkbox"}');
INSERT INTO proposal_questions VALUES('will_provide_organism','BOOLEAN','Will user provide the organism for us to grow under deuterated conditions?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('organism_name','SMALL_TEXT','What is the organism','{"topic":"biological-deuteration","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('reference_pdf','FILE_UPLOAD','Please attach a reference or protocol of culture conditions and media composition','{"topic":"biological-deuteration","small_label":"Accepted formats: PDF"}');
INSERT INTO proposal_questions VALUES('material_amount','SMALL_TEXT','How much material do you need','{"topic":"biological-deuteration","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('material_condition','SMALL_TEXT','Indicate wet or dry mass','{"topic":"biological-deuteration","min":2, "max":5}');
INSERT INTO proposal_questions VALUES('amount_justification','LARGE_TEXT','Justify amount','{"topic":"biological-deuteration","min":10, "max":500}');
INSERT INTO proposal_questions VALUES('rq_deuteration_level','SELECTION_FROM_OPTIONS','Level of deuteration required','{"topic":"biological-deuteration","variant":"radio","options":["Partial (65-80% with unlabeled carbon source)", "Full (~99% with labeled carbon source)"]}');
INSERT INTO proposal_questions VALUES('d_level_justification','LARGE_TEXT','Justify level of D incorporation','{"topic":"biological-deuteration","min":10, "max":500}');
INSERT INTO proposal_questions VALUES('recombinant_protein','BOOLEAN','Recombinant protein (E. coli)','{"topic":"biological-deuteration","variant":"slider"}');
INSERT INTO proposal_questions VALUES('molecule_name_for_deuteration','SMALL_TEXT','Name of molecule to be deuterated:','{"topic":"biological-deuteration","small_label":"(e.g. superoxide dismutase)"}');
INSERT INTO proposal_questions VALUES('bio_deu_fasta','SMALL_TEXT','FASTA sequence or Uniprot number','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_molecular_weight','SMALL_TEXT','Molecular weight (kDA)','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_oligomerization_state','SMALL_TEXT','Oligomerization state','{"topic":"biological-deuteration", "small_label":"(e.g. homodimer, tetramer etc.)"}');
INSERT INTO proposal_questions VALUES('bio_deu_cofactors_ligands','LARGE_TEXT','Does the protein have any co-factors or ligands required for expression? Specify:','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_origin','SMALL_TEXT','Origin of molecules:','{"topic":"biological-deuteration", "small_label":"(e.g. human, E. coli, S. cerevisiae)"}');
INSERT INTO proposal_questions VALUES('bio_deu_plasmid_provided','SELECTION_FROM_OPTIONS','Will you provide an expression plasmid?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"], "small_text":"If you choose no, we will design & order a plasmid commercially"}');
INSERT INTO proposal_questions VALUES('bio_deu_material_amount','SMALL_TEXT','How much material do you need?','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_material_amount_justification','SMALL_TEXT','Justify amount:','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_d_lvl_req','SELECTION_FROM_OPTIONS','Level of deuteration required:','{"topic":"biological-deuteration","variant":"radio","options":["Full (~99% with labeled carbon source)", "Partial (65-80% with unlabeled carbon source)", "Partial (25-30% H/D exchange)"]}');
INSERT INTO proposal_questions VALUES('bio_deu_d_lvl_req_justification','SMALL_TEXT','Justify level of D incorporation:','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_purification_need','SELECTION_FROM_OPTIONS','Will you need DEMAX to purify the protein from deuterated biomass?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('bio_deu_has_expressed','SELECTION_FROM_OPTIONS','Has expression been done for the unlabeled protein?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('bio_deu_typical_yield','SMALL_TEXT','Typical yield:','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('bio_deu_purification_done','SELECTION_FROM_OPTIONS','Have you been able to purify the unlabeled protein?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('bio_deu_has_deuteration_experience','SELECTION_FROM_OPTIONS','Have you tried to deuterate the protein yourself, even in small scale?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('yeast_derived_lipid_amnt','BOOLEAN','Yeast-derived total lipid extract (P. pastoris)','{"topic":"biological-deuteration"}');
INSERT INTO proposal_questions VALUES('yeast_derived_material_amount','SMALL_TEXT','How much material do you need?','{"topic":"biological-deuteration","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('yeast_derived_material_amount_justification','SMALL_TEXT','Justify amount','{"topic":"biological-deuteration","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('yeast_derived_d_lvl_req','SELECTION_FROM_OPTIONS','Level of deuteration required:','{"topic":"biological-deuteration","variant":"radio","options":["Full (~99% with labeled carbon source)", "Partial (65-80% with unlabeled carbon source)", "Partial (25-30% H/D exchange)"]}');
INSERT INTO proposal_questions VALUES('yeast_derived_d_lvl_req_justification','SMALL_TEXT','Justify level of D incorporation:','{"topic":"biological-deuteration","min":2, "max":200}');
INSERT INTO proposal_questions VALUES('bio_deu_other','BOOLEAN','Other','{"topic":"biological-deuteration","variant":"slider"}');
INSERT INTO proposal_questions VALUES('bio_deu_other_desc','LARGE_TEXT','For requests that do not fit any of options above','{"topic":"biological-deuteration","min":10, "max":500}');
INSERT INTO proposal_questions VALUES('biosafety_containment_level','SELECTION_FROM_OPTIONS','Which biosafety containment level is required to work with your sample?','{"topic":"biological-deuteration","variant":"radio", "options":["L1", "L2"]}');
INSERT INTO proposal_questions VALUES('biosafety_has_risks','SELECTION_FROM_OPTIONS','Is your organism a live virus, toxin-producing, or pose ay risk to human health and/or the environment?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_recombinant','SELECTION_FROM_OPTIONS','Is the protein recombinant?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_toxin','SELECTION_FROM_OPTIONS','Is the sample a toxin?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_virulence','SELECTION_FROM_OPTIONS','Is the sample a virulence factor?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_prion','SELECTION_FROM_OPTIONS','Is the sample a prion protein?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_has_hazard_ligand','SELECTION_FROM_OPTIONS','Does the sample have a hazardous ligand (e.g. heavy metal, toxic molecule etc.)?','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_is_organism_active','SMALL_TEXT','If the sample is a a bacteria or virus, specificy whether it is inactive/active:','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('biosafety_explanation','SMALL_TEXT','If you answered "yes" to any of the above, please explan:','{"topic":"biological-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_enabled','BOOLEAN','Check box to select chemical deuteration','{"topic":"chemical-deuteration"}');
INSERT INTO proposal_questions VALUES('chem_deu_molecule_name','SMALL_TEXT','Molecule/s to be deuterated (name):','{"topic":"chemical-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_amount','SMALL_TEXT','Amount of material required (mass):','{"topic":"chemical-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_amount_justification','LARGE_TEXT','Justify amount','{"topic":"chemical-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_d_percentage','SMALL_TEXT','indicate percentage and location of deuteration','{"topic":"chemical-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_structure_justification','LARGE_TEXT','Justify level of deuteration','{"topic":"chemical-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_chem_structure','FILE_UPLOAD','Attach chemical structure','{"topic":"chemical-deuteration"}');
INSERT INTO proposal_questions VALUES('chem_deu_prep_source','SELECTION_FROM_OPTIONS','Has this molecule (or an unlabeled/isotopic analogue) been prepared by yourself or others?','{"topic":"chemical-deuteration","variant":"radio", "options":["yes", "no"]}');
INSERT INTO proposal_questions VALUES('chem_deu_protocol','FILE_UPLOAD','If yes, please provide a protocol (attach a reference PDF if published)','{"topic":"chemical-deuteration"}');





INSERT INTO proposal_question_dependencies VALUES('links_with_industry', 'has_links_with_industry', '{ "condition": "equals", "params":"yes" }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_molecule_name', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('amino_seq', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('molecular_weight', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('oligomerization_state', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('pdb_id', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('doi_or_alike', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('reference_file', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_cofactors_ligands', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('prec_composition', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_experience', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('crystallization_time', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('crystal_size', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('protein_details_lbl', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('typical_yield', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('storage_conditions', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('stability', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('protein_buffer', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('is_deuterated', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('protein_concentration', 'has_crystallization', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('is_biomass', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('will_provide_organism', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('organism_name', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('reference_pdf', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('material_amount', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('material_condition', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('amount_justification', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('rq_deuteration_level', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('d_level_justification', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('molecule_name_for_deuteration', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_fasta', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_molecular_weight', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_oligomerization_state', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_cofactors_ligands', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_origin', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_plasmid_provided', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_material_amount', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_material_amount_justification', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_d_lvl_req', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_d_lvl_req_justification', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_purification_need', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_has_expressed', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_typical_yield', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_purification_done', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_has_deuteration_experience', 'recombinant_protein', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_material_amount', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_material_amount_justification', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_d_lvl_req', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('yeast_derived_d_lvl_req_justification', 'yeast_derived_lipid_amnt', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('bio_deu_other_desc', 'bio_deu_other', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_containment_level', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_has_risks', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_recombinant', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_toxin', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_virulence', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_prion', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_has_hazard_ligand', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_is_organism_active', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('biosafety_explanation', 'slide_select_deuteration', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_molecule_name', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_amount', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_amount_justification', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_d_percentage', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_structure_justification', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_chem_structure', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_prep_source', 'chem_deu_enabled', '{ "condition": "equals", "params":"true" }');
INSERT INTO proposal_question_dependencies VALUES('chem_deu_protocol', 'chem_deu_prep_source', '{ "condition": "equals", "params":"yes" }');


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

