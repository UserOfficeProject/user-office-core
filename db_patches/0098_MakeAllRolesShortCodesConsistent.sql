DO
$$
BEGIN
	IF register_patch('MakeAllRolesShortCodesConsistent.sql', 'martintrajanovski', 'Make all role short codes lowercase and consistent', '2021-06-14') THEN
    BEGIN
      UPDATE roles SET short_code=lower(short_code);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
