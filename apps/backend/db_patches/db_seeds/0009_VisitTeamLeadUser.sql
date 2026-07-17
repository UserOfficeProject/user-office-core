-- Test user used by the visit team lead / non-lead e2e tests (see apps/e2e initialDBData.ts, user4 / id 997).
-- Seeds run after all patches, so this must use the current users schema (oidc_sub / institution_id),
-- not the legacy username/password columns that later patches drop. Login matches by email, and
-- upsertUser backfills oidc_sub on first login (see OAuthAuthorization.upsertUser).
INSERT INTO users(
  user_id, user_title, firstname, lastname, preferredname, oidc_sub, oauth_refresh_token, email, created_at, updated_at, institution_id
)
VALUES (
  997, 'Ms.', 'Laerke', 'Sorensen', 'Laerke', 'lksorensen.oauthsub', 'dummy-refresh-token', 'lksorensen@foodplanet.co.dk', NOW(), NOW(), 1
);

INSERT INTO role_user (role_id, user_id) VALUES (1, 997);
