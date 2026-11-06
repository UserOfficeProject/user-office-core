DO
$$
BEGIN
	IF register_patch('AddMeetingScore.sql', 'TCMeldrum', 'Add meeting score column to FapMeeting table', '2026-09-23') THEN
	BEGIN

        ALTER TABLE fap_meeting_decisions
            ADD COLUMN IF NOT EXISTS meeting_score varchar(255);

        -- BACKWARDS COMPATIBILITY: For existing meeting decisions

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;