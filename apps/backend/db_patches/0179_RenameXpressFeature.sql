DO
$$
BEGIN
	IF register_patch('0179_RenameXpressFeature.sql', 'Simon Fernandes', 'Rename Xpress feature (STFC_XPRESS_MANAGEMENT > TECHNIQUE_PROPOSALS)', '2025-04-15') THEN
	BEGIN

    UPDATE features
    SET feature_id = 'TECHNIQUE_PROPOSALS'
    WHERE feature_id = 'STFC_XPRESS_MANAGEMENT';

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
