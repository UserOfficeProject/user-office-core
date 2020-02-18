/*
author: 
    fredrikbolmsten
purpose: 
    Adding new columns for proposals
date:
    16.feb.2020
*/

ALTER TABLE proposals ADD COLUMN rank_order INT DEFAULT NULL;
ALTER TABLE proposals ADD COLUMN final_status INT DEFAULT NULL;
