DO
$$
BEGIN
	IF register_patch('0215_FAPMeetingDecisionsSupportFAPSwitching', 'Zachary Hankin', 'Set fap_meeting_decisions to be able to handle instrument switching assigned FAPs', '2026-09-28') THEN
	BEGIN
			ALTER TABLE fap_meeting_decisions DROP CONSTRAINT fap_meeting_decisions_pkey;
			ALTER TABLE fap_meeting_decisions ADD PRIMARY KEY (proposal_pk, instrument_id, fap_id);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;