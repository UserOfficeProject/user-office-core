DO
$$
BEGIN
  IF register_patch('0170_MoveVisitStatusField', 'Jekabs Karklins', 'Move visit status field from visits to visits_has_users', '2025-01-27') THEN
    BEGIN
      ALTER TABLE visits DROP COLUMN status;
      ALTER TABLE visits_has_users DROP COLUMN is_registration_submitted;

      CREATE TYPE user_visit_status AS ENUM ('DRAFTED', 'SUBMITTED', 'APPROVED', 'DISAPPROVED');
      ALTER table visits_has_users ADD COLUMN status user_visit_status DEFAULT 'DRAFTED' NOT NULL;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
