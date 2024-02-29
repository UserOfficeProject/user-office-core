DO
$$
BEGIN
    IF register_patch('0148_AddRabbitMQMessageBrokerFeature.sql', 'martintrajanovski', 'Create RabbitMQ message broker feature', '2024-02-29') THEN

    INSERT INTO features(feature_id, description) VALUES ('RABBITMQ_MESSAGE_BROKER', 'RabbitMQ message broker');

    END IF;
END;
$$
LANGUAGE plpgsql;