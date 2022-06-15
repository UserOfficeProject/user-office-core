DO
$$
BEGIN
	IF register_patch('AddSubmittedFlagToProposalsAndAddStatusConstraint.sql', 'martintrajanovski', 'Add submitted flag to proposals table and add status constraint', '2020-09-15') THEN
    BEGIN

        ALTER TABLE proposals ADD COLUMN submitted BOOLEAN DEFAULT FALSE;
        
        UPDATE proposals
        SET submitted = true
        WHERE status > 0;

        UPDATE proposals
        SET status = 1
        WHERE status = 0;

        ALTER TABLE proposals RENAME COLUMN status TO status_id;

        ALTER TABLE proposals ADD CONSTRAINT proposals_proposal_statuses_id_fkey FOREIGN KEY (status_id) REFERENCES proposal_statuses(proposal_status_id) ON DELETE CASCADE;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;