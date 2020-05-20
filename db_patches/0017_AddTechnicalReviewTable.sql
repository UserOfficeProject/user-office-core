DO
$$
BEGIN
	IF register_patch('AddTechnicalReviewTable.sql', 'fredrikbolmsten', 'Adding new table for technical review ', '2020-01-24') THEN
	BEGIN


  

        CREATE TABLE IF NOT EXISTS technical_review(
            technical_review_id serial UNIQUE,
            proposal_id int REFERENCES proposals (proposal_id) ON UPDATE CASCADE ON DELETE CASCADE UNIQUE,
            comment text DEFAULT NULL,
            time_allocation INT DEFAULT NULL,
            status  INT DEFAULT NULL
        );



    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
