DO
$$
BEGIN
	IF register_patch('AddCallEndedFlagToCalls.sql', 'martintrajanovski', 'Add call_ended flag to calls', '2020-10-30') THEN
        BEGIN
            ALTER TABLE call ADD COLUMN call_ended BOOLEAN DEFAULT FALSE;
            ALTER TABLE call ADD COLUMN call_review_ended BOOLEAN DEFAULT FALSE;
            ALTER TABLE call ADD COLUMN start_sep_review TIMESTAMPTZ DEFAULT NOW();
            ALTER TABLE call ADD COLUMN end_sep_review TIMESTAMPTZ DEFAULT NOW();
            ALTER TABLE call ADD COLUMN call_sep_review_ended BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;