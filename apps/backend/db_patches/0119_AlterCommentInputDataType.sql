DO
$DO$
BEGIN
	IF register_patch('AlterCommentInputDataType.sql', 'Jekabs Karklins', 'Altering SEP review comment datatype', '2022-04-07') THEN
    BEGIN
      

      ALTER TABLE "SEP_Reviews" ALTER COLUMN comment TYPE text;

    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
