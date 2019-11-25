ALTER TABLE users DROP COLUMN organisation_address;
ALTER TABLE users DROP COLUMN nationality;
ALTER TABLE users DROP COLUMN organisation;

ALTER TABLE users ADD COLUMN organisation INTEGER REFERENCES institutions (institution_id);

ALTER TABLE users ADD COLUMN nationality INTEGER REFERENCES nationalities (nationality_id);
