DO
$$
DECLARE 
   t_row role_user%rowtype;
BEGIN
    IF register_patch('AlterInstrumentHasProposalTable.sql', 'Peter Asztalos', 'Alter instrument_has_proposal table so deleting a proposal will cascade delete', '2021-02-15') THEN

      ALTER TABLE instrument_has_proposals DROP CONSTRAINT instrument_has_proposals_proposal_id_fkey;

      ALTER TABLE instrument_has_proposals 
        ADD CONSTRAINT instrument_has_proposals_proposal_id_fkey 
            FOREIGN KEY (proposal_id)
            REFERENCES proposals (proposal_id) 
            ON UPDATE CASCADE 
            ON DELETE CASCADE;

    END IF;
END;
$$
LANGUAGE plpgsql;