DO
$$
BEGIN
  IF register_patch('AddXpressStatuses.sql', 'Simon Fernandes', 'Add statuses for Xpress', '2024-10-07') THEN
    BEGIN

      -- All required for e2e tests
      INSERT INTO proposal_statuses(name, description, is_default, short_code)
      VALUES('Under review', 'The proposal is under review.', true, 'UNDER_REVIEW');

      INSERT INTO proposal_statuses(name, description, is_default, short_code)
      VALUES('Approved', 'The proposal has been approved.', true, 'APPROVED');

      INSERT INTO proposal_statuses(name, description, is_default, short_code)
      VALUES('Finished', 'The experiment has been finished.', true, 'FINISHED');

      INSERT INTO proposal_statuses(name, description, is_default, short_code)
      VALUES('Unsuccessful', 'The proposal was unsuccessful.', true, 'UNSUCCESSFUL');

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
