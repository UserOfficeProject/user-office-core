

DO
$$
BEGIN
	IF register_patch('AddProposalStatusesTable.sql', 'martintrajanovski', 'Add proposals statuses table', '2020-09-09') THEN
    BEGIN
        CREATE TABLE IF NOT EXISTS proposal_statuses (
            proposal_status_id SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            description VARCHAR(200) NOT NULL
        );

        INSERT INTO proposal_statuses (name, description) VALUES ('DRAFT', 'When proposal is created it gets draft status before it is submitted.');
        INSERT INTO proposal_statuses (name, description) VALUES ('FEASIBILITY_REVIEW', 'Status that indicates that proposal feasibility review should be done.');
        INSERT INTO proposal_statuses (name, description) VALUES ('NOT_FEASIBLE', 'Status that indicates that proposal is not feasible.');
        INSERT INTO proposal_statuses (name, description) VALUES ('SEP_SELECTION', 'Status that indicates that proposal is ready to be assigned to SEP.');
        INSERT INTO proposal_statuses (name, description) VALUES ('SEP_REVIEW', 'Proposal SEP review should be done.');
        INSERT INTO proposal_statuses (name, description) VALUES ('ALLOCATED', 'Proposal time allocation should be done.');
        INSERT INTO proposal_statuses (name, description) VALUES ('NOT_ALLOCATED', 'Proposal is not allocated.');
        INSERT INTO proposal_statuses (name, description) VALUES ('SCHEDULING', 'Proposal should be scheduled.');
        INSERT INTO proposal_statuses (name, description) VALUES ('EXPIRED', 'Proposal has expired.');
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;