DO
$$
BEGIN
    IF register_patch('0156_AddProposalInstrumentUnsubmittedEvent', 'martintrajanovski', 'Add proposal FAP meeting instrument unsubmitted event', '2024-05-16') THEN

    ALTER TABLE proposal_events ADD COLUMN proposal_fap_meeting_instrument_unsubmitted BOOLEAN DEFAULT FALSE;

    END IF;
END;
$$
LANGUAGE plpgsql;