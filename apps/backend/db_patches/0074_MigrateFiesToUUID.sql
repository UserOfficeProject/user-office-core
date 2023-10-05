DO
$$
BEGIN
	IF register_patch('MigrateFileIdsToUUID.sql', 'jekabskarklins', 'Migrate files to file_id:UUID instead of file_id::BIGINT', '2020-11-27') THEN

		DROP TABLE answer_has_files; -- cleanup old unused table 
		
		CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- add extension required for generating UUIDs

		ALTER TABLE files ADD COLUMN file_uuid UUID DEFAULT uuid_generate_v4() NOT NULL; -- adding and propulating the new column



		-- updating references to the new column from old file_id to the new uuid
        CREATE OR REPLACE FUNCTION update_file_answers() RETURNS SETOF answers AS
        $BODY$
        DECLARE
            r answers%rowtype;
        BEGIN
            FOR r IN
				 select answers.* from answers
				 left join questions
				 ON answers.question_id = questions.question_id
				 where questions.data_type='FILE_UPLOAD' -- all FILE_UPLOAD answers 
            LOOP
				UPDATE answers 
				SET answer = jsonb_set(answer, '{value}', -- overwrite value with the new value
					(SELECT json_agg(files.file_uuid) FROM  -- json_agg() will group the separate rows back into array
					 (SELECT file_uuid FROM files WHERE file_id IN -- for every file_id look up corresponding UUID
					  	(SELECT jsonb_array_elements(answer->'value')::bigint
						 FROM answers WHERE answer_id=r.answer_id)) files)::jsonb -- if there are multiple, comma separated file_ids in field 'value' jsonb_array_elements() will convert it to multiple rows 
				)
				WHERE answer_id=r.answer_id;
                RETURN NEXT r; -- return current row of SELECT
            END LOOP;
            RETURN;
        END;
        $BODY$
        LANGUAGE plpgsql;

        PERFORM update_file_answers();


        DROP FUNCTION update_file_answers();
		
		
		
		
		-- Moving uuid as the first column and getting rid of the file_id column
        ALTER TABLE files rename to old_files; 
		
		ALTER INDEX files_pkey RENAME TO old_files_pkey;
		ALTER INDEX files_oid_key RENAME TO old_files_oid_key;

        CREATE TABLE files (
              file_id uuid DEFAULT uuid_generate_v4()
            , file_name     VARCHAR(512) NOT NULL
            , size_in_bytes INT
            , mime_type     VARCHAR(256) 
            , oid           INT UNIQUE
            , created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT files_pkey PRIMARY KEY (file_id),
            CONSTRAINT files_oid_key UNIQUE (oid)
        );

        INSERT INTO files (
            file_id,
            file_name, 
            size_in_bytes, 
            mime_type,
            oid,
            created_at
            ) 
        SELECT 
            file_uuid,
            file_name, 
            size_in_bytes, 
            mime_type,
            oid,
            created_at
        FROM 
            old_files;
	END IF;
END;
$$
LANGUAGE plpgsql;