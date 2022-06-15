DO
$$
BEGIN
	IF register_patch('ExtendMimeTypeField.sql', 'jekabskarklins', 'Extends mime type field length', '2020-11-23') THEN
        


        ALTER TABLE files ALTER COLUMN mime_type TYPE character varying(256);



	END IF;
END;
$$
LANGUAGE plpgsql;