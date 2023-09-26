DO
$$
BEGIN
	IF register_patch('AddRedeemCodesTable.sql', 'jekabskarklins', 'Add redeem_codes table', '2023-02-09') THEN
        CREATE TABLE IF NOT EXISTS
            redeem_codes(
                  code VARCHAR(12) PRIMARY KEY
                , placeholder_user_id INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE
                , created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
                , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                , claimed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
                , claimed_at TIMESTAMPTZ DEFAULT NULL
            );
	END IF;
END;
$$
LANGUAGE plpgsql;