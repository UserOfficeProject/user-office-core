DO
$$
BEGIN
    IF register_patch('AddProposalDownloadStatusAction.sql', 'simonfernandes', 'Add status action for proposal download', '2025-05-07') THEN
      BEGIN
        INSERT INTO status_actions(name, description, type)
        VALUES('Proposal download action', 'This is an action for proposal downloading. It can be configured to download PDFs from the factory and store them in the database.', 'PROPOSALDOWNLOAD');

        ALTER TABLE files
        ADD COLUMN internal_use BOOLEAN DEFAULT FALSE;
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;