DO
$$
BEGIN
    IF register_patch('RemoveUserSearchFilterFeature', 'Yoganandan Pandiyan', 'Remove obsolete user search filter feature flag', '2026-10-06') THEN
        DELETE FROM features WHERE feature_id = 'USER_SEARCH_FILTER';
    END IF;
END;
$$
LANGUAGE plpgsql;