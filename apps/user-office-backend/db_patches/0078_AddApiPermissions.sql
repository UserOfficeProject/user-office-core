DO
$$
BEGIN
	IF register_patch('AddApiPermissions.sql', 'martintrajanovski', 'Api permissions to be able to control the access to the api', '2021-01-26') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS api_permissions (
				access_token_id VARCHAR(64) PRIMARY KEY NOT NULL,
				name VARCHAR(64) NOT NULL,
				access_token VARCHAR(512) NOT NULL,
				access_permissions jsonb
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;