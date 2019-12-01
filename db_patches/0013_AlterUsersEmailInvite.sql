/*
author: 
    fredrikbolmsten
purpose: 
    Adding column for accounts created by invite
date:
    28.nov.2019
*/

ALTER TABLE users ADD COLUMN placeholder BOOLEAN DEFAULT FALSE;
