CREATE TABLE IF NOT EXISTS db_patches (
	patch_id  varchar(100) NOT NULL PRIMARY KEY
	, author    varchar(50) NOT NULL
	, purpose   varchar(600) NULL
	, created_at  TIMESTAMPTZ NOT NULL
	, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

CREATE OR REPLACE FUNCTION register_patch(new_patch_id TEXT, author TEXT, purpose TEXT, created_at TIMESTAMPTZ) RETURNS boolean AS $$
    BEGIN
    IF EXISTS (SELECT 1 FROM db_patches WHERE patch_id=new_patch_id) THEN
	RAISE WARNING 'Refusing to apply patch. Patch id % already present', new_patch_id;
        return false;
    ELSE 
        INSERT INTO db_patches VALUES(new_patch_id, author, purpose, created_at);
        return true;
    END IF;
    END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION unregister_patch(new_patch_id TEXT) RETURNS boolean AS $$
    BEGIN
    IF EXISTS (SELECT 1 FROM db_patches WHERE patch_id=new_patch_id) THEN
	RAISE NOTICE 'Unergistering pathc %', new_patch_id;
	DELETE FROM db_patches WHERE patch_id=new_patch_id;
        return true;
    ELSE 
        RAISE NOTICE 'Cant unregister. Patch % does not exist', new_patch_id;
        return false;
    END IF;
    END
$$ LANGUAGE plpgsql;