DO
$$
BEGIN
    IF register_patch('AddRorIdToInstitutions.sql', 'Junjie Quan', 'Add a ror_id field and drop verified field for institutions as verification will be done by ROR', '2021-12-06') THEN
    ALTER TABLE "institutions" 
      ADD COLUMN IF NOT EXISTS "ror_id" CHARACTER VARYING(100),
      DROP COLUMN IF EXISTS "verified";

      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01xtjs520' WHERE "institution_id" = 125;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/03vk18a84' WHERE "institution_id" = 13;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/05nf86y53' WHERE "institution_id" = 155;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/012a77v79' WHERE "institution_id" = 193;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/00b7x1x53' WHERE "institution_id" = 219;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01qz5mb56' WHERE "institution_id" = 244;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02ex6cf31' WHERE "institution_id" = 26;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/026vcq606' WHERE "institution_id" = 260;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/03gq8fr08' WHERE "institution_id" = 264;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01t8fg661' WHERE "institution_id" = 265;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/05f0yaq80' WHERE "institution_id" = 289;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/00jjx8s55' WHERE "institution_id" = 29;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/033003e23' WHERE "institution_id" = 301;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/05kb8h459' WHERE "institution_id" = 330;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02jx3x895' WHERE "institution_id" = 359;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/03zga2b32' WHERE "institution_id" = 363;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01111rn36' WHERE "institution_id" = 368;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/03p74gp79' WHERE "institution_id" = 379;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/035b05819' WHERE "institution_id" = 383;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/024mrxd33' WHERE "institution_id" = 412;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/04h699437' WHERE "institution_id" = 413;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01xtthb56' WHERE "institution_id" = 425;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02be6w209' WHERE "institution_id" = 441;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/048a87296' WHERE "institution_id" = 495;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01aj84f44' WHERE "institution_id" = 5;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/006e5kg04' WHERE "institution_id" = 507;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/00x69rs40' WHERE "institution_id" = 532;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/012ajp527' WHERE "institution_id" = 533;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/033eqas34' WHERE "institution_id" = 534;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/04xfq0f34' WHERE "institution_id" = 536;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02mb95055' WHERE "institution_id" = 537;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/05xpvk416' WHERE "institution_id" = 538;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/020rbyg91' WHERE "institution_id" = 540;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/05j7fep28' WHERE "institution_id" = 541;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/05krs5044' WHERE "institution_id" = 546;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02hpa6m94' WHERE "institution_id" = 547;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02feahw73' WHERE "institution_id" = 548;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/03r8q5f36' WHERE "institution_id" = 549;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/058kzsd48' WHERE "institution_id" = 550;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/04zaypm56' WHERE "institution_id" = 551;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/03angcq70' WHERE "institution_id" = 552;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02x681a42' WHERE "institution_id" = 553;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/04g6bbq64' WHERE "institution_id" = 7;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/01wv9cn34' WHERE "institution_id" = 78;
      UPDATE "institutions" SET "ror_id" = 'https://ror.org/02nv7yv05' WHERE "institution_id" = 80;

    END IF;
END;
$$
LANGUAGE plpgsql;

