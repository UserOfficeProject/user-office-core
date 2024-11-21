DO
$$
BEGIN
  IF register_patch('0166_DropUserMergeStoreProc.sql', 'Chi Kai Lam', 'Drop stored procedure of merge user tool', '2024-11-21') THEN
    BEGIN
      DROP TABLE MERGING_TABLE_REGISTRY;
      DROP FUNCTION REPLACE_OLD_USER_ID_WITH_NEW;
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
