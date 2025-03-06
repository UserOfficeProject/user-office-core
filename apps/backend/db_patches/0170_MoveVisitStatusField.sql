DO
$$
BEGIN
  IF register_patch('0170_MoveVisitStatusField', 'Jekabs Karklins', 'Move visit status field from visits to visits_has_users', '2025-01-27') THEN
    BEGIN
      ALTER TABLE visits DROP COLUMN status;
      ALTER TABLE visits_has_users DROP COLUMN is_registration_submitted;

      ALTER TABLE visits_has_users 
        ADD COLUMN status VARCHAR(20) DEFAULT 'DRAFTED' NOT NULL;

      ALTER TABLE visits_has_users 
        ADD CONSTRAINT chk_status 
          CHECK (status IN ('DRAFTED', 'SUBMITTED', 'APPROVED', 'CHANGE_REQUESTED', 'CANCELLED_BY_USER', 'CANCELLED_BY_FACILITY'));
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
