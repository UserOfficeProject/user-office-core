DO
$$
BEGIN
	IF register_patch('AddN8nChatWebhookUrlSetting.sql', 'jekabskarklins', 'Adding n8n chat webhook url to settings', '2026-09-24') THEN
	BEGIN
        INSERT INTO settings (settings_id, settings_value, description) 
        VALUES ('N8N_CHAT_WEBHOOK_URL', '', 'n8n chat webhook URL; the AI assistant widget is hidden when empty') 
        ON CONFLICT DO NOTHING;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
