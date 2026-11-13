DO
$$
BEGIN
	IF register_patch('AddOAuthClients.sql', 'jekabskarklins', 'OAuth clients registered in an external identity provider, with the endpoints each client is allowed to call', '2026-09-03') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS oauth_clients (
				client_id VARCHAR(255) PRIMARY KEY NOT NULL,
				name VARCHAR(100) NOT NULL,
				description VARCHAR(500),
				access_permissions jsonb,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
