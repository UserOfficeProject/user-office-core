DO
$$
DECLARE
  tag_id_var BIGINT;
BEGIN
    IF register_patch('9998_CasbinPOC.sql', 'simonfernandes', 'Casbin', '2026-01-16') THEN
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

        /* Can only delete proposal if PI of proposal and proposal is submitted */
        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user', 'proposal', 'delete', 'r.obj.proposerId == r.sub.userId && r.obj.submitted', 'allow');

        /* Can only read calls with ISIS tag and 2026 in shortCode */
        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user_officer', 'call', 'read', 'hasTag(r.obj.tags, ''ISIS'') && regexMatch(r.obj.shortCode, ''2026'')', 'allow');

        /* Can only archive LSF calls */
        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user_officer', 'call', 'archive', 'regexMatch(r.obj.shortCode, ''LSF'')', 'allow');

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