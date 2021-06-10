DO
$$
BEGIN
	IF register_patch('AddFooterPageContent.sql', 'Simon Fernandes', 'Add footer content to pagetext table', '2021-06-09') THEN
	
		BEGIN
		  INSERT INTO 
			pagetext(pagetext_id, content)
		  VALUES
			('6', '');
		END;
		
	END IF;
END;
$$
LANGUAGE plpgsql;
