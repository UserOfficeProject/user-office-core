DO
$$
DECLARE
  tag_id_var BIGINT;
BEGIN
    IF register_patch('9998_CaslPOC.sql', 'scotthurley', 'Casl', '2026-01-29') THEN
      BEGIN
CREATE TABLE IF NOT EXISTS permissions(
            permission_id serial UNIQUE,
            action varchar(100) DEFAULT NULL,
            subject varchar(100) DEFAULT NULL,
            conditions varchar(100) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS role_has_permission (
      role_id int REFERENCES roles (role_id) ON UPDATE CASCADE,
      permission_id int REFERENCES permissions (permission_id) ON UPDATE CASCADE,
      CONSTRAINT role_has_permission_pkey PRIMARY KEY (role_id, permission_id)
);

INSERT INTO role_user (role_id, user_id) VALUES (2, <user_number>);

INSERT INTO permissions(action, subject, conditions) VALUES ('update','fap','{"id": 11}');

INSERT INTO role_has_permission(role_id, permission_id) VALUES (2, 1);

      END;
    END IF;
END;
$$
LANGUAGE plpgsql;