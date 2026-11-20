DO
$$
BEGIN
    IF register_patch(
        '0218_RemovePartiallyFeasibleTechnicalReviewStatus.sql',
        'Jekabs Karklins',
        'Unset technical review status for reviews marked as partially feasible',
        '2026-11-19'
    ) THEN
        UPDATE technical_review SET status = NULL WHERE status = 1;
    END IF;
END;
$$
LANGUAGE plpgsql;
