DO
$$
BEGIN
  --The MERGING_TABLE_REGISTRY table and REPLACE_OLD_USER_ID_WITH_NEW function are applicable to STFC only
  --so they are relocated to STFC private repos and dropped from user-office-core repos. 
  --The business logic of the REPLACE_OLD_USER_ID_WITH_NEW function.
  --  Discover the target column in tables with a foreign key constraint on the USER_ID field of the USERS table, 
  --    then save the findings into the MERGING_TABLE_REGISTRY table.
  --  Retrieve the MERGING_TABLE_REGISTRY table and perform the following checks:
  --    Determine if the target column is part of the primary or unique key constraint of the table.
  --      1. If the key constraint is composite, generate two SQL statements:
  --          a. Update the target column of the table to the new user ID 
  --               where the target column equals the old user ID and doesn't overlap with the new user ID, 
  --               considering the other part of the composite key is identical.
  --          b. Delete from the target table 
  --               where the target column equals the old user ID and overlaps with the new user ID, 
  --               while the other part of the composite key is identical.
  --      2. If the key constraint is NOT composite, generate a SQL statement to 
  --           update the target column of the target table to the new user ID 
  --           where the target column equals the old user ID.
  --  Delete from USERS table where USER_ID field equals old user id.
  IF REGISTER_PATCH('RelocateOldUserIdWithNewFunc.SQL', 'CHI KAI LAM', 'UPDATE USER ID FOR MERGING', '2024-11-21') THEN
    BEGIN
      CREATE TABLE IF NOT EXISTS MERGING_TABLE_REGISTRY (
        TABLE_NAME  VARCHAR(100) NOT NULL, 
        COLUMN_NAME  VARCHAR(100) NOT NULL, 
        CREATED_AT  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (TABLE_NAME, COLUMN_NAME)
      );

      --CREATE MERGING USER ID FUNCTION
      CREATE OR REPLACE FUNCTION REPLACE_OLD_USER_ID_WITH_NEW(INOUT P_OLD_USER_ID BIGINT, INOUT P_NEW_USER_ID BIGINT)
      LANGUAGE PLPGSQL AS
      $DO$
      DECLARE
        NEW_USER_CNT      INTEGER := 0;
        OLD_USER_CNT      INTEGER := 0;
        MTR_PK_UN_COL_CNT INTEGER := 0;
        MTR_REC           record;
        MTR_PK_UN_REC     record;
        UPD_SQL           TEXT;
        DEL_SQL           TEXT;
        EXIST_SEL         TEXT;
        EXIST_WH          TEXT;
        IS_NEW_USERID	  INTEGER;
      BEGIN
        IF P_OLD_USER_ID = P_NEW_USER_ID THEN 
            RETURN;
        END IF; 
        SELECT COUNT(*) FROM USERS WHERE USER_ID = P_OLD_USER_ID INTO OLD_USER_CNT;
        IF OLD_USER_CNT = 0 THEN 
            RETURN;
        END IF; 
        TRUNCATE TABLE MERGING_TABLE_REGISTRY;
        INSERT INTO MERGING_TABLE_REGISTRY (TABLE_NAME, COLUMN_NAME) 
        SELECT KCU.TABLE_NAME, KCU.column_name FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC 
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU
            ON TC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
            AND TC.TABLE_SCHEMA = KCU.TABLE_SCHEMA
          JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS CCU
            ON CCU.CONSTRAINT_NAME = TC.CONSTRAINT_NAME
          WHERE TC.CONSTRAINT_TYPE = 'FOREIGN KEY'
            AND UPPER(TC.TABLE_SCHEMA) ='PUBLIC'
            AND UPPER(CCU.TABLE_SCHEMA) ='PUBLIC'
            AND UPPER(CCU.COLUMN_NAME) ='USER_ID'
            AND UPPER(CCU.TABLE_NAME) ='USERS';
        SELECT COUNT(*) FROM USERS WHERE USER_ID = P_NEW_USER_ID INTO NEW_USER_CNT;
        IF NEW_USER_CNT = 0 THEN
            INSERT INTO USERS (USER_ID, FIRSTNAME, LASTNAME, USERNAME, GENDER, BIRTHDATE, DEPARTMENT, POSITION, EMAIL, TELEPHONE) 
              VALUES (P_NEW_USER_ID, '', '', P_NEW_USER_ID, '', NOW(), '', '', P_NEW_USER_ID, '');
        END IF;
        FOR MTR_REC IN SELECT TABLE_NAME, COLUMN_NAME 
          FROM MERGING_TABLE_REGISTRY ORDER BY TABLE_NAME, COLUMN_NAME 
        LOOP
          MTR_PK_UN_COL_CNT := 0;
          UPD_SQL := '';
          DEL_SQL := '';
          EXIST_SEL := '';
          EXIST_WH := '';
          UPD_SQL = 'UPDATE ' || MTR_REC.TABLE_NAME || ' AS T1 SET ' || MTR_REC.COLUMN_NAME ||
                  ' = ' || P_NEW_USER_ID || ' WHERE T1.' || MTR_REC.COLUMN_NAME || ' = ' || P_OLD_USER_ID ||' ';
          FOR MTR_PK_UN_REC IN SELECT KCU.TABLE_NAME, CCU.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC 
              JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU
                ON TC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
                AND TC.TABLE_SCHEMA = KCU.TABLE_SCHEMA
              JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS CCU
                ON CCU.CONSTRAINT_NAME = TC.CONSTRAINT_NAME
              WHERE ( 
                TC.CONSTRAINT_TYPE = 'PRIMARY KEY'
                OR TC.CONSTRAINT_TYPE = 'UNIQUE'
                ) 
                AND UPPER(TC.TABLE_SCHEMA) ='PUBLIC'
                AND UPPER(CCU.TABLE_SCHEMA) ='PUBLIC'
                AND KCU.TABLE_NAME = MTR_REC.TABLE_NAME
                AND KCU.COLUMN_NAME = MTR_REC.COLUMN_NAME
          LOOP 
            MTR_PK_UN_COL_CNT := MTR_PK_UN_COL_CNT + 1;
            IF MTR_PK_UN_COL_CNT = 2 THEN 
              DEL_SQL = 'DELETE FROM ' || MTR_REC.TABLE_NAME || 
              ' T1 WHERE '|| MTR_REC.COLUMN_NAME ||
              ' = ' ||P_OLD_USER_ID;
            END IF;
            IF LENGTH(EXIST_WH) > 0 THEN
              EXIST_WH = EXIST_WH || ' AND T2.';
            END IF;
            IS_NEW_USERID := 0;
            SELECT COUNT(*) FROM MERGING_TABLE_REGISTRY 
              WHERE TABLE_NAME = MTR_PK_UN_REC.TABLE_NAME 
              AND COLUMN_NAME = MTR_PK_UN_REC.COLUMN_NAME 
              INTO IS_NEW_USERID;
            IF IS_NEW_USERID = 1 THEN
              EXIST_WH = EXIST_WH || MTR_PK_UN_REC.COLUMN_NAME || ' = ' || P_NEW_USER_ID ;
            ELSE 
              IF LENGTH(EXIST_SEL) > 0 THEN 
                EXIST_SEL = EXIST_SEL || ', ';
              END IF;
              EXIST_SEL = EXIST_SEL || 'T2.' || MTR_PK_UN_REC.COLUMN_NAME;
              EXIST_WH = EXIST_WH || MTR_PK_UN_REC.COLUMN_NAME || ' = T1.' || MTR_PK_UN_REC.COLUMN_NAME;
            END IF;               
          END LOOP;
          IF MTR_PK_UN_COL_CNT > 1 THEN
            UPD_SQL := UPD_SQL || ' AND NOT EXISTS ( SELECT ' || EXIST_SEL || ' FROM ' || MTR_REC.TABLE_NAME || ' T2 WHERE T2.' || EXIST_WH || '); ';
            DEL_SQL := DEL_SQL || ' AND EXISTS ( SELECT '  || EXIST_SEL || ' FROM ' || MTR_REC.TABLE_NAME || ' T2 WHERE T2.' || EXIST_WH || '); ';
          END IF;
          RAISE NOTICE '%',UPD_SQL;
          EXECUTE UPD_SQL;
          IF LENGTH(DEL_SQL) > 0 THEN 
            RAISE NOTICE '%',DEL_SQL;
            EXECUTE DEL_SQL;
          END IF;
        END LOOP;
        DELETE FROM USERS WHERE USER_ID = P_OLD_USER_ID;
        RETURN; 
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'ROLLBACK REPLACE_OLD_USER_ID_WITH_NEW FUNC WITH OLD USER ID: % AND NEW USER ID: %', P_OLD_USER_ID, P_NEW_USER_ID;
      END;
      $DO$;
    END;
    --Testing the health check for the "REPLACE_OLD_USER_ID_WITH_NEW" function. 
    --PERFORM REPLACE_OLD_USER_ID_WITH_NEW(0,0);
    DROP TABLE MERGING_TABLE_REGISTRY;
    DROP FUNCTION REPLACE_OLD_USER_ID_WITH_NEW;
  END IF;
END;
$$
LANGUAGE PLPGSQL;
