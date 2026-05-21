DO
$$
BEGIN
  IF register_patch('0210_AddIdPkToVisitsHasUsers.sql', 'GitHubCopilot', 'Add UUID primary key to visits_has_users', '2026-05-19') THEN
    BEGIN
      ALTER TABLE visits_has_users
      ADD COLUMN id UUID;

      UPDATE visits_has_users
      SET id = uuid_generate_v4()
      WHERE id IS NULL;

      ALTER TABLE visits_has_users
      ALTER COLUMN id SET NOT NULL;

      ALTER TABLE visits_has_users
      ALTER COLUMN id SET DEFAULT uuid_generate_v4();

      ALTER TABLE visits_has_users
      DROP CONSTRAINT IF EXISTS visits_has_users_pkey;

      ALTER TABLE visits_has_users
      ADD CONSTRAINT visits_has_users_pkey PRIMARY KEY (id);

      ALTER TABLE visits_has_users
      ADD CONSTRAINT visits_has_users_visit_id_user_id_key UNIQUE (visit_id, user_id);
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
