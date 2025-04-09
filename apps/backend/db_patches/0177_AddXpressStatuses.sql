DO
$$
BEGIN
  IF register_patch('0177_AddXpressStatuses', 'Simon Fernandes', 'Add Xpress statuses', '2025-04-03') THEN

    INSERT INTO statuses (name, description, is_default, short_code, entity_type)
    SELECT 'Quick review', 'Status used as an identifier for Xpress calls/workflows.', TRUE, 'QUICK_REVIEW', 'PROPOSAL'
    WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE short_code = 'QUICK_REVIEW');

    INSERT INTO statuses (name, description, is_default, short_code, entity_type)
    SELECT 'Under review', 'Status that indicates the Xpress proposal is currently being reviewed.', TRUE, 'UNDER_REVIEW', 'PROPOSAL'
    WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE short_code = 'UNDER_REVIEW');

    INSERT INTO statuses (name, description, is_default, short_code, entity_type)
    SELECT 'Approved', 'Status that indicates the Xpress proposal is approved.', TRUE, 'APPROVED', 'PROPOSAL'
    WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE short_code = 'APPROVED');

    INSERT INTO statuses (name, description, is_default, short_code, entity_type)
    SELECT 'Unsuccessful', 'Status that indicates the Xpress proposal is unsuccessful.', TRUE, 'UNSUCCESSFUL', 'PROPOSAL'
    WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE short_code = 'UNSUCCESSFUL');

    INSERT INTO statuses (name, description, is_default, short_code, entity_type)
    SELECT 'Finished', 'Status that indicates the Xpress proposal is finished.', TRUE, 'FINISHED', 'PROPOSAL'
    WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE short_code = 'FINISHED');

  END IF;
END;
$$
LANGUAGE plpgsql;