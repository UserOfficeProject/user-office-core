DO
$$
BEGIN
	IF register_patch('AlterEventLog.sql', 'fredrikbolmsten', 'Delete row on user removal', '2020-04-20') THEN
	BEGIN

    alter table event_logs
    drop constraint IF EXISTS event_logs_changed_by_fkey,
        add constraint event_logs_changed_by_fkey
        foreign key (changed_by)
        references users(user_id)
        on delete cascade;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;