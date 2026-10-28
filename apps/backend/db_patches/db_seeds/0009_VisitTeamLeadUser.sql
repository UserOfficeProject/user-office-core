-- Test users used by the visit team lead / visitor e2e tests (see apps/e2e initialDBData.ts).
-- None of them are the principal investigator or a co-proposer of the seeded proposal, so they
-- exercise the team lead and visitor authorization paths without proposal membership granting
-- access on its own.
--   997 -> user4          (plain visitor)
--   990 -> visitTeamLead  (team lead of the visit)
--   991 -> visitor1       (plain visitor)
--   992 -> visitor2       (plain visitor)
-- Seeds run after all patches, so this must use the current users schema (oidc_sub / institution_id),
-- not the legacy username/password columns that later patches drop. Login matches by email, and
-- upsertUser backfills oidc_sub on first login (see OAuthAuthorization.upsertUser).
INSERT INTO users(
  user_id, user_title, firstname, lastname, preferredname, oidc_sub, oauth_refresh_token, email, created_at, updated_at, institution_id
)
VALUES
  (997, 'Ms.', 'Laerke', 'Sorensen', 'Laerke', 'lksorensen.oauthsub', 'dummy-refresh-token', 'lksorensen@foodplanet.co.dk', NOW(), NOW(), 1),
  (990, 'Mr.', 'Tomas', 'Toivonen', 'Tomas', 'ttoivonen.oauthsub', 'dummy-refresh-token', 'ttoivonen@foodplanet.co.dk', NOW(), NOW(), 1),
  (991, 'Ms.', 'Miriam', 'Mikkola', 'Miriam', 'mmikkola.oauthsub', 'dummy-refresh-token', 'mmikkola@foodplanet.co.dk', NOW(), NOW(), 1),
  (992, 'Mx.', 'Alex', 'Aalto', 'Alex', 'aaalto.oauthsub', 'dummy-refresh-token', 'aaalto@foodplanet.co.dk', NOW(), NOW(), 1);

INSERT INTO role_user (role_id, user_id) VALUES
  (1, 997),
  (1, 990),
  (1, 991),
  (1, 992);
