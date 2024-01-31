DO
$$
BEGIN
	IF register_patch('AddSafetyNotificationFeature.sql', 'krzysztofklimczyk', 'Add new role', '2024-01-29') THEN
	BEGIN
		INSERT INTO roles (short_code, title) VALUES('safety_manager', 'Safety Manager');
		ALTER TABLE proposal_events ADD proposal_safety_notified bool NULL DEFAULT false;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;