DO
$$
DECLARE 
   t_row role_user%rowtype;
BEGIN
    IF register_patch('UpdateSepRelatedTables.sql', 'Peter Asztalos', 'Refactors how we store sep and user connections', '2021-02-15') THEN

      CREATE TABLE "SEP_Reviewers" (
            user_id  int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
          , sep_id int NOT NULL REFERENCES "SEPs"(sep_id) ON DELETE CASCADE
          , PRIMARY KEY (user_id, sep_id)
      );

      ALTER TABLE public."SEPs"
          ADD COLUMN sep_chair_user_id int DEFAULT NULL REFERENCES users(user_id) ON DELETE SET NULL
        , ADD COLUMN sep_secretary_user_id int DEFAULT NULL REFERENCES users(user_id) ON DELETE SET NULL;

      -- migrate SEP_Chair data
      FOR t_row in (
          SELECT role_user.* FROM role_user
          INNER JOIN roles ON roles.role_id = role_user.role_id
          WHERE sep_id IS NOT NULL AND short_code = 'SEP_Chair'
      ) LOOP
        UPDATE "SEPs" SET sep_chair_user_id = t_row.user_id
        WHERE sep_id = t_row.sep_id;
      END LOOP;

      -- migrate SEP_Secretary data
      FOR t_row in (
          SELECT role_user.* FROM role_user 
          INNER JOIN roles ON roles.role_id = role_user.role_id
          WHERE sep_id IS NOT NULL AND short_code = 'SEP_Secretary'
      ) LOOP
        UPDATE "SEPs" SET sep_secretary_user_id = t_row.user_id
        WHERE sep_id = t_row.sep_id;
      END LOOP;

      -- fill up SEP_Reviewers table with existing data
      INSERT INTO "SEP_Reviewers" (user_id, sep_id) 
      ( 
        SELECT role_user.user_id, role_user.sep_id 
        FROM role_user 
        INNER JOIN roles ON roles.role_id = role_user.role_id
        WHERE sep_id IS NOT NULL AND short_code = 'SEP_Reviewer'
      );

      -- drop sep_id, we no longer need it
      ALTER TABLE role_user DROP COLUMN sep_id;

      -- remove older reviewer role references
      UPDATE role_user SET role_id = (
        SELECT roles.role_id
        FROM roles
        WHERE short_code = 'SEP_Reviewer'
      ) 
      WHERE role_id IN ( 
        SELECT roles.role_id
        FROM roles
        WHERE short_code = 'reviewer'
      );

      -- remove duplicate rows
      FOR t_row in (
        SELECT role_id, user_id FROM role_user
        GROUP BY (role_id, user_id)
        HAVING COUNT(*) > 1
      ) LOOP
        DELETE FROM role_user WHERE role_id = t_row.role_id AND user_id = t_row.user_id;
        INSERT INTO role_user (role_id, user_id) VALUES (t_row.role_id, t_row.user_id);
      END LOOP;

      -- make sure we don't have duplicates in the future
      ALTER TABLE role_user ADD CONSTRAINT user_role_unique_idx UNIQUE (user_id, role_id);

      -- delete `Reviewer` role
      DELETE FROM roles WHERE short_code = 'reviewer';

    END IF;
END;
$$
LANGUAGE plpgsql;