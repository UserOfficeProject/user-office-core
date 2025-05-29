DO
$$
BEGIN
	IF register_patch('0181_BackfillSubmittedDate.sql', 'ACLay', 'Set submitted date column on proposals that predate it', '2025-05-19') THEN
	BEGIN

    UPDATE proposals AS p 
       SET submitted_date = (SELECT MAX(logs.event_tstamp)
                               FROM event_logs logs
                              WHERE logs.changed_object_id = CAST(p.proposal_pk AS VARCHAR)
                                    AND logs.event_type = 'PROPOSAL_SUBMITTED')
     WHERE p.submitted
           AND p.submitted_date IS NULL
           AND CAST(p.proposal_pk AS VARCHAR) IN (SELECT changed_object_id
                                                    FROM event_logs
                                                   WHERE event_type = 'PROPOSAL_SUBMITTED');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
