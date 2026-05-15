DO
$$
BEGIN
  IF register_patch('0210_AddTagsToTechniques', 'Scott-James-Hurley', 'Add tags to techniques', '2026-05-13') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS tag_technique
      (
          tag_id integer NOT NULL REFERENCES tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
          technique_id integer NOT NULL REFERENCES techniques (technique_id) ON UPDATE CASCADE ON DELETE CASCADE,
          PRIMARY KEY (tag_id, technique_id)
      );
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;