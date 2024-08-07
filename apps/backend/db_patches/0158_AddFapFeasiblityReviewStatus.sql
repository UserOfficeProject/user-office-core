

DO
$$
BEGIN
	IF register_patch('AddFapFeasiblityReviewStatus.sql', 'tcmeldrum', 'Add proposals statuses table', '2024-07-12') THEN
    BEGIN

        INSERT INTO proposal_statuses (name, description, is_default, short_code) VALUES ('FAP_AND_FEASIBILITY_REVIEW', 'Status that indicates that proposal feasibility review and Fap Review should be done.', true, 'FAP_AND_FEASIBILITY_REVIEW');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;