DO
$$
BEGIN
	IF register_patch('0217_AddUpdateCommentToVersionsTable.sql', 'ellenwright', 'Add update coment to versions table', '2026-11-5') THEN

        ALTER TABLE template_versions
            ADD COLUMN IF NOT EXISTS update_comment VARCHAR(500);

	END IF;
END;
$$
LANGUAGE plpgsql;