DO
$$
BEGIN
	IF register_patch('AddDataAccessUserHasProposalTable.sql', 'jekabskarklins', 'Add data_access_user_has_proposal table to manage users with data access to proposals', '2025-07-11') THEN
	BEGIN
        CREATE TABLE data_access_user_has_proposal (
              proposal_pk int REFERENCES proposals (proposal_pk) ON DELETE CASCADE
            , user_id int REFERENCES users (user_id) ON DELETE CASCADE
            , PRIMARY KEY (proposal_pk, user_id)
        );
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
