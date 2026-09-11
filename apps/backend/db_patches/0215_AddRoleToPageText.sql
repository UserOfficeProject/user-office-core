DO
$$
BEGIN
    IF register_patch(
       'AddRoleToPageText',
       'Scott Hurley',
       'Add role id to page text table.',
       '2026-09-08'
     ) THEN
      BEGIN

        ALTER TABLE pagetext
          ADD COLUMN page_id integer,
          ADD COLUMN role_id integer REFERENCES roles (role_id) ON UPDATE CASCADE ON DELETE CASCADE;

        UPDATE pagetext SET page_id = pagetext_id;

        ALTER TABLE pagetext
          ADD CONSTRAINT page_id_not_null NOT NULL page_id,
          ADD CONSTRAINT unique_role_pages UNIQUE (page_id, role_id);

      END;
	  END IF;
END;
$$
LANGUAGE plpgsql;
