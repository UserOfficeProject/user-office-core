/*
author: 
    jekabskarklins
purpose: 
    BUGFIX can't save long answers
date:
    06.nov.2019
*/
ALTER TABLE proposal_answers ALTER COLUMN config TYPE TEXT;