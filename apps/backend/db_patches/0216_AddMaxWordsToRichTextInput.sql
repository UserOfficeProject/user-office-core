DO
$$
BEGIN
    IF register_patch(
        '0216_AddMaxWordsToRichTextInput.sql',
        'Josh Peters',
        'Add maxWords to existing rich text input question configs',
        '2026-10-08'
    ) THEN
        UPDATE questions
        SET default_config = jsonb_set(
            COALESCE(default_config::jsonb, '{}'::jsonb),
            '{maxWords}',
            'null'::jsonb,
            true
        )
        WHERE data_type = 'RICH_TEXT_INPUT';
    END IF;
END;
$$
LANGUAGE plpgsql;
