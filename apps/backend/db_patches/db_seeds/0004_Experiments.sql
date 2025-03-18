DO
$DO$
BEGIN

  INSERT INTO experiments(
    experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (000001, 996, '2030-01-07 10:00:00', '2030-01-07 11:00:00', 1, 'ACTIVE', 1, 1);

  INSERT INTO experiments(
    experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, instrument_id)
    VALUES (000002, 997, '2020-01-07 10:00:00', '2020-01-07 11:00:00', 1, 'ACTIVE', 1);

  INSERT INTO experiments(
    experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (000003, 998, '2030-01-07 12:00:00', '2030-01-07 13:00:00', 1, 'DRAFT', 1, 2);

  INSERT INTO experiments(
    experiment_id, scheduled_event_id, starts_at, ends_at, proposal_pk, status, local_contact_id, instrument_id)
    VALUES (000004, 999, '2030-02-07 12:00:00', '2030-02-07 13:00:00', 1, 'COMPLETED', 1, 1);

END;
$DO$
LANGUAGE plpgsql;
