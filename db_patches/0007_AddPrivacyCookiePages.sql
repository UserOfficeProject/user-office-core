DO
$$
BEGIN
	IF register_patch('AddPrivacyCookiePages.sql', 'fredrikbolmsten', 'Adding new pages', '2019-11-14') THEN
	BEGIN
  

		INSERT INTO pagetext (content) values ('PRIVACYPAGE');

		INSERT INTO pagetext (content) values ('COOKIEPAGE');



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;

