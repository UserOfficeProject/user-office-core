DO
$$
BEGIN
	IF register_patch('AddPkForVisitsHasUsers.sql', 'Jekabs Karklins', 'Add composite primary key for visits has users', '2021-07-28') THEN
		BEGIN
		  DELETE FROM visits_has_users; /* cleaning up */
		  ALTER TABLE visits_has_users add CONSTRAINT visits_has_users_pkey PRIMARY KEY (visit_id, user_id);
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
