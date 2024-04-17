DO
$$
BEGIN
    IF register_patch('0152_RemoveOAuthAccessToken.sql', 'janosbabik', '', '2024-04-05') THEN

    ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS oauth_access_token;

    END IF;
END;
$$
LANGUAGE plpgsql;