DO
$DO$
BEGIN

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status, local_contact, instrument_id)
    VALUES (996, 'USER_OPERATIONS', '2030-01-07 10:00:00', '2030-01-07 11:00:00', 1, 1, 'ACTIVE', 1, 1);

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status, instrument_id)
    VALUES (997, 'USER_OPERATIONS', '2020-01-07 10:00:00', '2020-01-07 11:00:00', 1, 1, 'ACTIVE', 1);

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status, local_contact, instrument_id)
    VALUES (998, 'USER_OPERATIONS', '2030-01-07 12:00:00', '2030-01-07 13:00:00', 1, 1, 'DRAFT', 1, 2);

  INSERT INTO scheduled_events(
    scheduled_event_id, booking_type, starts_at, ends_at, proposal_booking_id, proposal_pk, status, local_contact, instrument_id)
    VALUES (999, 'USER_OPERATIONS', '2030-02-07 12:00:00', '2030-02-07 13:00:00', 1, 1, 'COMPLETED', 1, 1);

END;
$DO$
LANGUAGE plpgsql;
