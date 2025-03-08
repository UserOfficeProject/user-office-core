DO
$$
BEGIN
  IF register_patch('0171_RemoveTrainingExpiryDate', 'Jekabs Karklins', 'Remove training expiry date', '2025-03-03') THEN
    BEGIN
      ALTER table visits_has_users DROP COLUMN training_expiry_date;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
