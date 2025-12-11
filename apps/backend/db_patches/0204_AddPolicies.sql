
DO
$$
BEGIN
    IF register_patch('AddPolicies.sql', 'Deepak Jaison', 'Add policies table', '2025-12-05') THEN
        BEGIN
            CREATE TABLE IF NOT EXISTS policies (
                        policy_id    SERIAL PRIMARY KEY,
                        role_id      INT NOT NULL REFERENCES roles (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
                        object       VARCHAR(255) NOT NULL,
                        action       VARCHAR(100) NOT NULL,
                        effect       VARCHAR(10) NOT NULL CHECK (effect IN ('allow','deny')),
                        call         INT,
                        technique    INT,
                        facility     INT,
                        instrument   INT,
                        CONSTRAINT policies_unique UNIQUE (role_id, object, action, effect)
                    );
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
