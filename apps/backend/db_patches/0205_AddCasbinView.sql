
DO
$$
BEGIN
    IF register_patch('AddCasbinView', 'Deepak Jaison', 'Add view for casbin rules', '2025-12-05') THEN
        BEGIN
            
            CREATE OR REPLACE VIEW casbin_rule AS
                SELECT
                'p'::text       AS ptype,       -- policy type: 'p'
                role_id         AS v0,          -- subject (role/user)
                object          AS v1,          -- resource path
                action          AS v2,          -- action
                call            AS v3,          -- attribute: call
                technique       AS v4,          -- attribute: technique
                instrument      AS v5,          -- attribute: instrument
                facility        AS v6,          -- attribute: facility
                effect          AS eft          -- effect: allow or deny
            FROM policies;

        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
