DO
$$
BEGIN
	IF register_patch('AddWorkflowStatusActions.sql', 'martintrajanovski', 'Workflow status actions for executing actions on proposal specific status', '2021-01-26') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS proposal_status_actions (
				proposal_status_action_id serial UNIQUE,
				name VARCHAR(64) NOT NULL,
				description TEXT NULL,
				type VARCHAR(512) NOT NULL
			);

			INSERT INTO proposal_status_actions(name, description, type)
    	VALUES('Email action', 'This is an action for email sending. It can be configured to use different recipients and email templates.', 'EMAIL');
			INSERT INTO proposal_status_actions(name, description, type)
    	VALUES('RabbitMQ action', 'This is an action for sending messages to a specific exchange. It can be configured to use different exchange name recipients and data.', 'RABBITMQ');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;