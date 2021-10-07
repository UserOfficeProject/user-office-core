DO
$DO$
BEGIN

UPDATE call
SET end_cycle = now() + '30 DAYS',
    start_cycle = now() - INTERVAL '1 DAY'
WHERE call_id = 1;

END;
$DO$
LANGUAGE plpgsql;
