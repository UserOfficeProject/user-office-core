DO
$$
BEGIN
  IF register_patch('0160_AddFilesToFapPanel.sql', 'TCMeldrum', 'Add files to a fap panel', '2024-08-06') THEN
    BEGIN

    ALTER TABLE faps ADD files jsonb;

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
