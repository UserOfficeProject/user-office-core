DO
$$
DECLARE
  tag_id_var BIGINT;
BEGIN
    IF register_patch('9998_CasbinPOC.sql', 'simonfernandes', 'Casbin', '2026-01-16') THEN
      BEGIN
        CREATE TABLE IF NOT EXISTS policies (
            id                    BIGSERIAL PRIMARY KEY,
            ptype                 VARCHAR(128) NOT NULL,
            role                  VARCHAR(128) NOT NULL DEFAULT '',
            "object"              VARCHAR(128) NOT NULL DEFAULT '',
            action                VARCHAR(128) NOT NULL DEFAULT '',
            facility              VARCHAR(128) NOT NULL DEFAULT '',
            "call"                VARCHAR(128) NOT NULL DEFAULT '',
            instrument_ids        TEXT[] NOT NULL DEFAULT '{}',
            instrument_operator   VARCHAR(128) NOT NULL DEFAULT '',
            custom_filter         VARCHAR(128) NOT NULL DEFAULT '',
            effect                VARCHAR(128) NOT NULL DEFAULT ''  -- e.g., 'allow' or 'deny'
          );

        INSERT INTO policies (ptype, role, "object", action, facility, "call", instrument_ids, instrument_operator, custom_filter, effect)
        VALUES ('p', 'user_officer', 'call', 'read', 'ISIS', '2026', ARRAY['1','2'], 'AND', 'r.obj.instrument_id != null', 'allow');


        DROP TABLE IF EXISTS casbin_rule CASCADE;
          
        CREATE OR REPLACE VIEW casbin_rule AS
        SELECT
          id,
          ptype,
          role     AS v0,
          "object" AS v1,
          action   AS v2,
          /* v3: dynamically composed ABAC expression */
            CASE
                WHEN (
                  NULLIF(facility, '') IS NULL
                  AND NULLIF("call", '') IS NULL
                  AND (instrument_ids IS NULL OR array_length(instrument_ids, 1) = 0)
                  AND NULLIF(custom_filter, '') IS NULL
                )
                THEN 'true'
                ELSE array_to_string(
                      array_remove(ARRAY[
                        -- facility → hasTag(...)
                        CASE
                          WHEN NULLIF(facility, '') IS NOT NULL
                          THEN format('hasTag(r.obj.tags, %L)', facility)
                        END,

                        -- call → regexMatch on shortCode
                        CASE
                          WHEN NULLIF("call", '') IS NOT NULL
                          THEN format('regexMatch(r.obj.shortCode, %L)', "call")
                        END,

                        -- instruments → depends on instrument_operator
                        CASE
                          WHEN instrument_ids IS NOT NULL AND array_length(instrument_ids, 1) > 0
                          THEN
                            CASE
                              WHEN upper(instrument_operator) = 'AND' THEN
                                -- Require ALL instruments to be present on r.obj.instrument_ids (array)
                                '(' || (
                                  SELECT string_agg(
                                            format('r.obj.instrument_id == %L', x),
                                            ' && '
                                          )
                                  FROM unnest(instrument_ids) AS t(x)
                                ) || ')'
                              ELSE
                                -- Default OR: match ANY one instrument against a singular r.obj.instrument_id
                                '(' || (
                                  SELECT string_agg(
                                            format('r.obj.instrument_id == %L', x),
                                            ' || '
                                          )
                                  FROM unnest(instrument_ids) AS t(x)
                                ) || ')'
                            END
                        END,

                        -- custom_filter → appended as-is if provided
                        CASE
                          WHEN NULLIF(custom_filter, '') IS NOT NULL
                          THEN custom_filter
                        END

                      ], NULL),
                      ' && '
                    )
              END AS v3,
          effect AS v4,
          ''::text AS v5
        FROM policies;

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
