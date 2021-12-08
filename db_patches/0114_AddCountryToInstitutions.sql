DO
$$
BEGIN
    IF register_patch('AddCountryToInstitutions.sql', 'Fredrik Bolmsten', 'Add a country field for institutions, useful for KPI generation', '2021-12-06') THEN

    ALTER TABLE "institutions" ADD "country_id" INT DEFAULT NULL;
    ALTER TABLE "institutions" ADD CONSTRAINT country_id_fkey 
        FOREIGN KEY ("country_id") 
        REFERENCES "countries" ("country_id");
    END IF;
END;
$$
LANGUAGE plpgsql;

