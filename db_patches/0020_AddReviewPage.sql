DO
$$
BEGIN
	IF register_patch('AddReviewPage.sql', 'Fredrik Bolmsten', 'Add new row for reviewpage text', '2020-03-18') THEN
	BEGIN



		INSERT INTO pagetext (content) values ('REVIEWPAGE');



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
