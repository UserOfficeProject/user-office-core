DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('AddUnits.sql', 'fredrikbolmsten', 'Adding units', '2021-02-02') THEN
	BEGIN

      CREATE TABLE units (
            unit_id serial UNIQUE,
            unit varchar(50) DEFAULT NULL
      ); 

    INSERT INTO units (unit) values ('kelvin');
	INSERT INTO units (unit) values ('celsius');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;