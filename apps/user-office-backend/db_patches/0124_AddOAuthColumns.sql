DO
$$
BEGIN
    IF register_patch('AddOAuthColumns.sql', 'Jekabs Karklins', 'Add OAuth columns to the users table', '2022-07-07') THEN

        /* oidc_sub */
        ALTER TABLE "users"
        RENAME COLUMN orcid TO oidc_sub;

        ALTER TABLE "users" 
        ALTER COLUMN oidc_sub DROP NOT NULL;

        ALTER TABLE "users"
        RENAME COLUMN orcid_refreshtoken TO oauth_refresh_token;
        
        ALTER TABLE "users" 
        ALTER COLUMN oauth_refresh_token TYPE varchar(2048);

        ALTER TABLE "users" 
        ALTER COLUMN oauth_refresh_token DROP NOT NULL;

        /* oauth_access_token */
        /* Token sizes set to standart sizes https://developers.google.com/identity/protocols/oauth2#size */
        ALTER TABLE "users"
        ADD COLUMN oauth_access_token VARCHAR(2048);

        ALTER TABLE "users"
        ADD COLUMN oauth_issuer VARCHAR(512);

        /* Update developmment entries, defined in 0000_init.sql file */
        UPDATE "users" SET oauth_access_token = 'dummy-access-token', oauth_refresh_token='dummy-refresh-token', oidc_sub='Javon4.oauthsub', oauth_issuer='dummy-issuer' WHERE email = 'Javon4@hotmail.com';
        UPDATE "users" SET oauth_access_token = 'dummy-access-token', oauth_refresh_token='dummy-refresh-token', oidc_sub='Aaron_Harris49.oauthsub', oauth_issuer='dummy-issuer' WHERE email = 'Aaron_Harris49@gmail.com';
        UPDATE "users" SET oauth_access_token = 'dummy-access-token', oauth_refresh_token='dummy-refresh-token', oidc_sub='nils.oauthsub', oauth_issuer='dummy-issuer' WHERE email = 'nils@ess.se';
        UPDATE "users" SET oauth_access_token = 'dummy-access-token', oauth_refresh_token='dummy-refresh-token', oidc_sub='ben.oauthsub', oauth_issuer='dummy-issuer' WHERE email = 'ben@inbox.com';
        UPDATE "users" SET oauth_access_token = 'dummy-access-token', oauth_refresh_token='dummy-refresh-token', oidc_sub='david.oauthsub', oauth_issuer='dummy-issuer' WHERE email = 'david@teleworm.us';
        UPDATE "users" SET oauth_access_token = NULL, oauth_refresh_token=NULL, oidc_sub=NULL, oauth_issuer=NULL WHERE email = 'unverified-user@example.com';

    END IF;
END;
$$
LANGUAGE plpgsql;