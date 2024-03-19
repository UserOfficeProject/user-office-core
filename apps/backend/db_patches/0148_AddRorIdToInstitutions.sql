DO
$$
BEGIN
    IF register_patch('AddRorIdToInstitutions.sql', 'Junjie Quan', 'Add a ror_id field and drop verified field for institutions as verification will be done by ROR', '2021-12-06') THEN
    ALTER TABLE "institutions" 
      ADD COLUMN IF NOT EXISTS "ror_id" CHARACTER VARYING(100),
      DROP COLUMN IF EXISTS "verified";
    
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01xtjs520', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'France' LIMIT 1),1) WHERE "institution_id" = 125;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/03vk18a84', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Australia' LIMIT 1),1) WHERE "institution_id" = 13;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/05nf86y53', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Japan' LIMIT 1),1) WHERE "institution_id" = 155;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/012a77v79', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Sweden' LIMIT 1),1) WHERE "institution_id" = 193;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/00b7x1x53', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country LIKE '%United States%' LIMIT 1),1) WHERE "institution_id" = 219;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01qz5mb56', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country LIKE '%United States%' LIMIT 1),1) WHERE "institution_id" = 244;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02ex6cf31', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country LIKE '%United States%' LIMIT 1),1) WHERE "institution_id" = 26;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/026vcq606', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Sweden' LIMIT 1),1) WHERE "institution_id" = 260;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/03gq8fr08', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 264;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01t8fg661', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 265;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/05f0yaq80', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Sweden' LIMIT 1),1) WHERE "institution_id" = 289;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/00jjx8s55', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'France' LIMIT 1),1) WHERE "institution_id" = 29;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/033003e23', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Finland' LIMIT 1),1) WHERE "institution_id" = 301;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/05kb8h459', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Sweden' LIMIT 1),1) WHERE "institution_id" = 330;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02jx3x895', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 359;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/03zga2b32', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Norway' LIMIT 1),1) WHERE "institution_id" = 363;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01111rn36', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Italy' LIMIT 1),1) WHERE "institution_id" = 368;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/03p74gp79', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'South Africa' LIMIT 1),1) WHERE "institution_id" = 379;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/035b05819', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Denmark' LIMIT 1),1) WHERE "institution_id" = 383;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/024mrxd33', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 412;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/04h699437', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 413;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01xtthb56', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Norway' LIMIT 1),1) WHERE "institution_id" = 425;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02be6w209', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Italy' LIMIT 1),1) WHERE "institution_id" = 441;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/048a87296', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Sweden' LIMIT 1),1) WHERE "institution_id" = 495;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01aj84f44', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Denmark' LIMIT 1),1) WHERE "institution_id" = 5;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/006e5kg04', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Belgium' LIMIT 1),1) WHERE "institution_id" = 507;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/00x69rs40', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Italy' LIMIT 1),1) WHERE "institution_id" = 532;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/012ajp527', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Italy' LIMIT 1),1) WHERE "institution_id" = 533;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/033eqas34', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Germany' LIMIT 1),1) WHERE "institution_id" = 534;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/04xfq0f34', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Germany' LIMIT 1),1) WHERE "institution_id" = 536;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02mb95055', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 537;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/05xpvk416', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country LIKE '%United States%' LIMIT 1),1) WHERE "institution_id" = 538;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/020rbyg91', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Japan' LIMIT 1),1) WHERE "institution_id" = 540;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/05j7fep28', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Australia' LIMIT 1),1) WHERE "institution_id" = 541;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/05krs5044', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 546;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02hpa6m94', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Spain' LIMIT 1),1) WHERE "institution_id" = 547;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02feahw73', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'France' LIMIT 1),1) WHERE "institution_id" = 548;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/03r8q5f36', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country LIKE '%United States%' LIMIT 1),1) WHERE "institution_id" = 549;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/058kzsd48', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Germany' LIMIT 1),1) WHERE "institution_id" = 550;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/04zaypm56', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Italy' LIMIT 1),1) WHERE "institution_id" = 551;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/03angcq70', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'United Kingdom' LIMIT 1),1) WHERE "institution_id" = 552;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02x681a42', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Switzerland' LIMIT 1),1) WHERE "institution_id" = 553;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/04g6bbq64', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Poland' LIMIT 1),1) WHERE "institution_id" = 7;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/01wv9cn34', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Sweden' LIMIT 1),1) WHERE "institution_id" = 78;
    UPDATE "institutions" SET "ror_id" = 'https://ror.org/02nv7yv05', "country_id" = COALESCE((SELECT country_id FROM countries WHERE country = 'Germany' LIMIT 1),1) WHERE "institution_id" = 80;

    END IF;
END;
$$
LANGUAGE plpgsql;

