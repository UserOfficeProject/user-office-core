DO
$$
DECLARE
  tag_id_var BIGINT;
BEGIN
    IF register_patch('9998_CasbinPOC.sql', 'simonfernandes', 'Casbin', '2026-01-16') THEN
      BEGIN
        CREATE TABLE casbin_rule (
          id BIGSERIAL PRIMARY KEY,
          ptype VARCHAR(128) NOT NULL,
          v0 VARCHAR(128) NOT NULL DEFAULT '',
          v1 VARCHAR(128) NOT NULL DEFAULT '',
          v2 VARCHAR(128) NOT NULL DEFAULT '',
          v3 TEXT NOT NULL DEFAULT '',
          v4 VARCHAR(128) NOT NULL DEFAULT '',
          v5 VARCHAR(128) NOT NULL DEFAULT ''
        );

        CREATE TABLE casbin_condition (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          condition JSONB NOT NULL
        );


        /* Creating ISIS tag and assigning latest 10 calls to it */
        INSERT INTO tag (name, short_code)
        VALUES ('ISIS', 'ISIS')
        RETURNING tag_id INTO tag_id_var;

        INSERT INTO tag_call (tag_id, call_id)
        SELECT tag_id_var, call_id
        FROM call
        ORDER BY call_id DESC
        LIMIT 10;

      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
