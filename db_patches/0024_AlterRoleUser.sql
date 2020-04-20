DO
$$
BEGIN
	IF register_patch('AlterRoleUser.sql', 'fredrikbolmsten', 'Delete user', '2020-04-02') THEN
	BEGIN

    alter table role_user
    drop constraint IF EXISTS role_user_user_id_fkey,
        add constraint role_user_user_id_fkey
        foreign key (user_id)
        references users(user_id)
        on delete cascade;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;