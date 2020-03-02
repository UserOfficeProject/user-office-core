/*
author: 
    fredrikbolmsten
purpose: 
    Adding new table for technical review 
date:
    24.jan.2020
*/

CREATE TABLE IF NOT EXISTS technical_review(
    technical_review_id serial UNIQUE,
    proposal_id int REFERENCES proposals (proposal_id) ON UPDATE CASCADE ON DELETE CASCADE UNIQUE,
    comment text DEFAULT NULL,
    time_allocation INT DEFAULT NULL,
    status  INT DEFAULT NULL
);
