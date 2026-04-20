DO
$$
BEGIN
  IF register_patch('Add tags to role and set variable for default roles', 'Fredrik Bolmsten', 'tag_to_role', '2025-12-09') THEN
    BEGIN
      -- Allow these to be nullable. We will drop the columns later as they are not used anymore.
      ALTER TABLE public.roles
      ADD COLUMN IF NOT EXISTS is_root_role BOOLEAN NOT NULL DEFAULT FALSE;

      ALTER TABLE roles
      ADD COLUMN permissions TEXT[] NOT NULL DEFAULT '{}';
      INSERT INTO roles (short_code, title, description, is_root_role) VALUES ('proposal_reader', 'Proposal Reader', 'Can read proposals based on tags assigned to the user.', true);
      CREATE TABLE roles_has_tags (
            role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE
          , tag_id INT NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE
          , UNIQUE(role_id, tag_id)
      ); 

      UPDATE public.roles SET is_root_role = TRUE;

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
