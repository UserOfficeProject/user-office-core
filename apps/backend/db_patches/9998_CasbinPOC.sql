DO
$$
DECLARE
  read_con_id_var BIGINT;
  update_con_id_var BIGINT;
  del_con_id_var BIGINT;
BEGIN
    IF register_patch('9998_CasbinPOC.sql', 'simonfernandes', 'Casbin', '2026-01-16') THEN
      BEGIN
        CREATE TABLE casbin_rule (
          id BIGSERIAL PRIMARY KEY,
          ptype VARCHAR(128) NOT NULL,
          v0 VARCHAR(128) NOT NULL DEFAULT '',
          v1 VARCHAR(128) NOT NULL DEFAULT '',
          v2 VARCHAR(128) NOT NULL DEFAULT '',
          v3 BIGINT NULL, -- references the id of the condition in casbin_condition
          v4 VARCHAR(128) NOT NULL DEFAULT '',
          v5 VARCHAR(128) NOT NULL DEFAULT ''
        );

        CREATE TABLE casbin_condition (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          condition JSONB NOT NULL
        );

        CREATE INDEX idx_casbin_rule_condition_id
        ON casbin_rule(v3);

        /* Create default conditions so that everything works initially until overwritten in UI */
        INSERT INTO casbin_condition (condition)
        VALUES ($json$
        {
          "id": "7246f7a3-ab6b-41cb-a24e-44cbb976be98",
          "rules": [
            {
              "id": "afd24676-2125-4964-bf86-86ac220b2714",
              "field": "proposal.statusShortCode",
              "value": "DRAFT",
              "operator": "=",
              "valueSource": "value"
            },
            {
              "id": "9047a6fb-7847-4804-82da-6ad4d214fdf9",
              "field": "proposal.statusShortCode",
              "value": "SUBMITTED_LOCKED",
              "operator": "=",
              "valueSource": "value"
            },
            {
              "id": "33d49e01-a895-44ea-a478-0f8ff2c67cc1",
              "field": "proposal.statusShortCode",
              "value": "EDITABLE_SUBMITTED",
              "operator": "=",
              "valueSource": "value"
            },
            {
              "id": "e7a334e7-fe0f-4df6-a830-2ab251465435",
              "field": "proposal.statusShortCode",
              "value": "EDITABLE_SUBMITTED_INTERNAL",
              "operator": "=",
              "valueSource": "value"
            }
          ],
          "combinator": "or"
        }
        $json$)
        RETURNING id INTO read_con_id_var;

        INSERT INTO casbin_condition (condition)
        VALUES ($json$
        {
          "rules": [
            {
              "not": false,
              "rules": [
                {
                  "field": "proposal.submitted",
                  "value": "false",
                  "operator": "=",
                  "valueSource": "value"
                },
                {
                  "field": "isCallEnded",
                  "value": "false",
                  "operator": "=",
                  "valueSource": "value"
                }
              ],
              "combinator": "and"
            },
            {
              "not": false,
              "rules": [
                {
                  "field": "proposal.statusShortCode",
                  "value": "EDITABLE_SUBMITTED",
                  "operator": "=",
                  "valueSource": "value"
                },
                {
                  "field": "isCallEnded",
                  "value": "false",
                  "operator": "=",
                  "valueSource": "value"
                }
              ],
              "combinator": "and"
            },
            {
              "not": false,
              "rules": [
                {
                  "field": "proposal.statusShortCode",
                  "value": "EDITABLE_SUBMITTED_INTERNAL",
                  "operator": "=",
                  "valueSource": "value"
                },
                {
                  "field": "user.isInternalUser",
                  "value": "true",
                  "operator": "=",
                  "valueSource": "value"
                },
                {
                  "field": "isCallEndedInternal",
                  "value": "false",
                  "operator": "=",
                  "valueSource": "value"
                }
              ],
              "combinator": "and"
            }
          ],
          "combinator": "or"
        }
        $json$)
        RETURNING id INTO update_con_id_var;

        INSERT INTO casbin_condition (condition)
        VALUES ($json$
        {
          "rules": [
            {
              "id": "05e3dc68-7469-4ecb-a2b0-0e1e61682336",
              "field": "proposal.proposerId",
              "value": "{user.id}",
              "operator": "=",
              "valueSource": "value"
            },
            {
              "id": "49840b08-f5c5-4fa9-a4ff-e9b6ecf04604",
              "field": "proposal.submitted",
              "value": "false",
              "operator": "=",
              "valueSource": "value"
            }
          ],
          "combinator": "and"
        }
        $json$)
        RETURNING id INTO del_con_id_var;

        /* Link conditions with policies */
        
        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user', 'proposal', 'read', read_con_id_var, 'allow');

        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user', 'proposal', 'update', update_con_id_var, 'allow');

        INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4)
        VALUES ('p', 'user', 'proposal', 'delete', del_con_id_var, 'allow');

      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
