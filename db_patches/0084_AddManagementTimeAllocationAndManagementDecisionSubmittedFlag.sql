DO
$$
BEGIN
	IF register_patch('AddManagementTimeAllocationAndManagementDecisionSubmittedFlag.sql', 'martintrajanovski', 'Add management time allocation and management decision submitted flag', '2021-03-10') THEN
        BEGIN
            ALTER TABLE proposals ADD COLUMN management_decision_submitted BOOLEAN DEFAULT FALSE;
            ALTER TABLE proposals ADD COLUMN management_time_allocation INT DEFAULT NULL;

            ALTER TABLE proposal_events ADD COLUMN proposal_management_decision_updated BOOLEAN DEFAULT FALSE;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;