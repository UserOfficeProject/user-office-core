-- Test user used by the visit team lead / non-lead e2e tests (see apps/e2e initialDBData.ts, user id 997)
INSERT INTO users (
                  user_id,
                  user_title,
                  firstname,
                  middlename,
                  lastname,
                  username,
                  password,
                  preferredname,
                  orcid,
                  orcid_refreshToken,
                  gender,
                  nationality,
                  birthdate,
                  organisation,
                  department,
                  organisation_address,
                  position,
                  email,
                  email_verified,
                  telephone,
                  telephone_alt
                  )
VALUES
                (
                  997,
                  'Ms.',
                  'Laerke',
                  'Laerke',
                  'Sorensen',
                  'lksorensen',
                  '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                  'Laerke',
                  '123123124',
                  '581459605',
                  'female',
                  'Danish',
                  '1990-01-01',
                  'FoodPlanet',
                  'Research',
                  'Copenhagen',
                  'Researcher',
                  'lksorensen@foodplanet.co.dk',
                  true,
                  '0676 472 14 67',
                  '0676 159 94 88'
                  );

INSERT INTO role_user (role_id, user_id) VALUES (1, 997);
