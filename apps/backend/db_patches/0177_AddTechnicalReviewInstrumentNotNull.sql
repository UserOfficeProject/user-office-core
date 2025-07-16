DO
$$
BEGIN
  -- Check if there are any rows with NULL instrument_id
  IF EXISTS (SELECT 1 FROM technical_review WHERE instrument_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot make instrument_id NOT NULL: There are technical reviews with NULL instrument_id values. Please fix these entries first.';
  END IF;

  -- Add NOT NULL constraint to instrument_id column
  ALTER TABLE technical_review ALTER COLUMN instrument_id SET NOT NULL;
END;
$$
LANGUAGE plpgsql;
