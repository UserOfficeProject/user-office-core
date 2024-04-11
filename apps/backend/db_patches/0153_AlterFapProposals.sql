DO
$$
BEGIN
    IF register_patch('0153_AlterFapProposals.sql','Farai Mutambara', 'Implementing deleting proposal on fap_proposals', '2024-04-10') THEN

      ALTER TABLE fap_proposals
        DROP CONSTRAINT IF EXISTS fap_proposals_proposal_pk_fkey,
        ADD CONSTRAINT fap_proposals_proposal_pk_fkey FOREIGN KEY (proposal_pk) REFERENCES proposals(proposal_pk) ON DELETE CASCADE;

    END IF;
END;
$$
LANGUAGE plpgsql;