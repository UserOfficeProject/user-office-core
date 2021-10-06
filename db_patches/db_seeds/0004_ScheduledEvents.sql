DO
$DO$
BEGIN

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status)
    VALUES (996, 'USER_OPERATIONS', '2023-01-07 10:00:00', '2023-01-07 11:00:00', 1, 1, 'ACTIVE');

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status)
    VALUES (997, 'USER_OPERATIONS', '2020-01-07 10:00:00', '2020-01-07 11:00:00', 1, 1, 'ACTIVE');

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status)
    VALUES (998, 'USER_OPERATIONS', '2023-01-07 12:00:00', '2023-01-07 13:00:00', 1, 1, 'DRAFT');

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status)
    VALUES (999, 'USER_OPERATIONS', '2023-02-07 12:00:00', '2023-02-07 13:00:00', 1, 1, 'COMPLETED');

END;
$DO$
LANGUAGE plpgsql;
