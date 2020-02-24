
/*
author: 
    jekabskarklins
purpose: 
    Adding column nid (natural id)
date:
    24.feb.2020
*/

ALTER TABLE proposal_questions 
    ADD COLUMN natural_key VARCHAR(128) UNIQUE; 

UPDATE proposal_questions SET natural_key = proposal_question_id;
