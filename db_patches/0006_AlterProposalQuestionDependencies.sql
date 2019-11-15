/*
author: 
    jekabskarklins
purpose: 
    BUGFIX can't save long dependencies
date:
    11.nov.2019
*/
ALTER TABLE proposal_question_dependencies ALTER COLUMN condition TYPE VARCHAR(1024);