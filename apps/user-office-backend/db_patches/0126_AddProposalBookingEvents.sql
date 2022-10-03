DO
$$
BEGIN
	IF register_patch('AddProposalBookingEvents.sql', 'martintrajanovski', 'Add proposal_booking_* events', '2022-09-19') THEN
        BEGIN
            ALTER TABLE proposal_events
            ADD COLUMN proposal_booking_time_slot_added BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_booking_time_slots_removed BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_booking_time_activated BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_booking_time_updated BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_booking_time_completed BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_booking_time_reopened BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;