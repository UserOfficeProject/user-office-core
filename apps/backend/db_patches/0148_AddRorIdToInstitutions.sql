DO
$$
BEGIN
    IF register_patch('AddRorIdToInstitutions.sql', 'Junjie Quan', 'Add a ror_id field and drop verified field for institutions as verification will be done by ROR', '2021-12-06') THEN
    ALTER TABLE "institutions" 
      ADD COLUMN IF NOT EXISTS "ror_id" CHARACTER VARYING(100),
      DROP COLUMN IF EXISTS "verified";
    END IF;
END;
$$
LANGUAGE plpgsql;

