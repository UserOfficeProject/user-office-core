DO
$$
BEGIN
    IF register_patch('0182_AddPreferStoredProposalPdfsFeature.sql', 'simonfernandes', 'Add feature to prefer downloading a pregenerated PDF.', '2025-05-27') THEN
      BEGIN
        INSERT INTO features(feature_id, is_enabled, description)
        VALUES ('PREFER_PREGENERATED_PROPOSAL_DOWNLOAD', false, 'Download database-stored (pregenerated) proposal PDFs where available.');
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;