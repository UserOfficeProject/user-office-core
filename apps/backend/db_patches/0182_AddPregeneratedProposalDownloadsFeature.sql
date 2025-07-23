DO
$$
BEGIN
    IF register_patch('0182_AddPregeneratedProposalDownloadsFeature.sql', 'simonfernandes', 'Add feature for storing/downloading pregenerated PDFs.', '2025-05-27') THEN
      BEGIN
        INSERT INTO features(feature_id, is_enabled, description)
        VALUES ('PREGENERATED_PROPOSALS', false, 'Feature relating to the storage and download of database-stored (pregenerated) proposal PDFs. Enabling this a) allows use of the "Proposal Download" status action, b) shows the "Proposal Download" status action logs menu and c) attempts to download pregenerated PDFs before falling back to Factory generation.');
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;