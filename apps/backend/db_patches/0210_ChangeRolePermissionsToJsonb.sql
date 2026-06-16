
DO
$$
BEGIN
	IF register_patch('ChangeRolePermissionsToJsonb', 'jekabskarklins', 'Change role permissions to jsonb', '2026-05-13') THEN
	BEGIN
    ALTER TABLE roles DROP COLUMN IF EXISTS permissions;

    ALTER TABLE roles
      ADD COLUMN config JSONB NOT NULL DEFAULT '{}';

    UPDATE roles SET config = '{"note":""}' 
    WHERE short_code = 'user';

    UPDATE roles SET config = '{"hasLogAccess":true,"hasTechnicalReviewAccess":true,"hasFapAccess":true,"hasAdminAccess":false}' 
    WHERE short_code = 'proposal_reader';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
