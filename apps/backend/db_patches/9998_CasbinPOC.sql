DO
$$
BEGIN
    IF register_patch('9998_CasbinPOC.sql', 'simonfernandes', 'Casbin', '16-01-2026') THEN
      BEGIN
        CREATE TABLE IF NOT EXISTS casbin_rule (
          id BIGSERIAL PRIMARY KEY,
          ptype VARCHAR(128) NOT NULL,
          v0 VARCHAR(128) NOT NULL DEFAULT '',
          v1 VARCHAR(128) NOT NULL DEFAULT '',
          v2 VARCHAR(128) NOT NULL DEFAULT '',
          v3 VARCHAR(128) NOT NULL DEFAULT '',
          v4 VARCHAR(128) NOT NULL DEFAULT '',
          v5 VARCHAR(128) NOT NULL DEFAULT ''
        );

        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user', 'proposal', 'delete', '(r.obj.proposerId == r.sub.userId) && r.obj.submitted', 'allow');

        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user_officer', 'call', 'read', 'hasTag(''ISIS'') && !regexMatch(r.obj.shortCode, ''2026'')', 'allow');

        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user_officer', 'call', 'archive', 'regexMatch(r.obj.shortCode, ''Dutch'')', 'allow');
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;