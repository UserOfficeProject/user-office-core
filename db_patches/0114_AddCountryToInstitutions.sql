DO
$$
BEGIN
    IF register_patch('AddCountryToInstitutions.sql', 'Fredrik Bolmsten', 'Add a country field for institutions, useful for KPI generation', '2021-12-06') THEN
    ALTER TABLE "institutions" ADD "country_id" INT DEFAULT 1;
    ALTER TABLE "institutions" ADD CONSTRAINT country_id_fkey 
        FOREIGN KEY ("country_id") 
        REFERENCES "countries" ("country_id");
    ALTER TABLE "institutions" ALTER COLUMN country_id DROP DEFAULT;
    END IF;
END;
$$
LANGUAGE plpgsql;

