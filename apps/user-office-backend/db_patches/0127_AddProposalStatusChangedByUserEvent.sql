DO
$$
BEGIN
	IF register_patch('AddProposalStatusChangedByUserEvent.sql', 'martintrajanovski', 'Add proposal_status_changed_by_user event', '2022-10-07') THEN
        BEGIN
            ALTER TABLE proposal_events
            ADD COLUMN proposal_status_changed_by_user BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_status_changed_by_workflow BOOLEAN DEFAULT FALSE,
            ADD COLUMN proposal_updated BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;