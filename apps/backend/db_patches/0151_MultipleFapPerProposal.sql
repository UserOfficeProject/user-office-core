DO
$$
BEGIN
	IF register_patch('0151_MultipleFapPerProposal.sql', 'martintrajanovski', 'Mutliple FAP per proposal', '2024-04-03') THEN
	BEGIN

			ALTER TABLE fap_proposals ADD COLUMN fap_proposal_id SERIAL NOT NULL UNIQUE;
			ALTER TABLE fap_proposals DROP CONSTRAINT fap_proposals_pkey;
			ALTER TABLE fap_proposals ADD PRIMARY KEY (fap_proposal_id);
			ALTER TABLE fap_proposals ALTER COLUMN fap_id DROP NOT NULL;
			ALTER TABLE fap_proposals ADD COLUMN instrument_has_proposals_id INT REFERENCES instrument_has_proposals(instrument_has_proposals_id) ON UPDATE CASCADE ON DELETE CASCADE;
			UPDATE fap_proposals
			SET instrument_has_proposals_id = (SELECT instrument_has_proposals_id FROM instrument_has_proposals WHERE instrument_has_proposals.proposal_pk = fap_proposals.proposal_pk AND instrument_has_proposals.instrument_id = fap_proposals.instrument_id);
			ALTER TABLE technical_review ADD COLUMN instrument_has_proposals_id INT REFERENCES instrument_has_proposals(instrument_has_proposals_id) ON UPDATE CASCADE ON DELETE CASCADE;
			UPDATE technical_review
			SET instrument_has_proposals_id = (SELECT instrument_has_proposals_id FROM instrument_has_proposals WHERE instrument_has_proposals.proposal_pk = technical_review.proposal_pk AND instrument_has_proposals.instrument_id = technical_review.instrument_id);

			ALTER TABLE fap_assignments 
			ADD COLUMN fap_proposal_id INT REFERENCES fap_proposals (fap_proposal_id) ON UPDATE CASCADE ON DELETE CASCADE;
			UPDATE fap_assignments
			SET fap_proposal_id = (SELECT fap_proposal_id FROM fap_proposals WHERE fap_proposals.proposal_pk = fap_assignments.proposal_pk AND fap_proposals.fap_id = fap_assignments.fap_id);
			ALTER TABLE fap_assignments ALTER COLUMN fap_proposal_id SET NOT NULL;

			ALTER TABLE fap_reviews 
			ADD COLUMN fap_proposal_id INT REFERENCES fap_proposals (fap_proposal_id) ON UPDATE CASCADE ON DELETE CASCADE;
			UPDATE fap_reviews
			SET fap_proposal_id = (SELECT fap_proposal_id FROM fap_proposals WHERE fap_proposals.proposal_pk = fap_reviews.proposal_pk AND fap_proposals.fap_id = fap_reviews.fap_id);
			ALTER TABLE fap_reviews ALTER COLUMN fap_proposal_id SET NOT NULL;
	
			-- drop view to allow recreating it
    	DROP VIEW proposal_table_view;

    	-- re-create newest view query with order by
		  CREATE VIEW proposal_table_view AS
			SELECT
				p.proposal_pk,
				p.title,
				p.proposer_id AS principal_investigator,
				p.status_id AS proposal_status_id,
				ps.name AS proposal_status_name,
				ps.description AS proposal_status_description,
				p.proposal_id,
				p.final_status,
				p.notified,
				p.questionary_id,
				p.submitted,
				t.technical_reviews,
				ihp.instruments,
				fp.faps,
				fp.fap_instruments,
				c.call_short_code,
				c.allocation_time_unit,
				c.call_id,
				c.proposal_workflow_id
			FROM proposals p
			LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
			LEFT JOIN call c ON c.call_id = p.call_id
			LEFT JOIN (
				SELECT
					fp_1.proposal_pk,
					jsonb_agg(
						jsonb_build_object(
							'id', f.fap_id,
							'code', f.code
						) ORDER BY fp_1.fap_proposal_id ASC
					) AS faps,
					jsonb_agg(
						jsonb_build_object(
							'instrumentId', fp_1.instrument_id,
							'fapId', f.fap_id
						)
					) AS fap_instruments
				FROM fap_proposals fp_1
				JOIN faps f ON f.fap_id = fp_1.fap_id
				GROUP BY fp_1.proposal_pk
			) fp ON fp.proposal_pk = p.proposal_pk
			LEFT JOIN (
				SELECT
					t_1.proposal_pk,
					jsonb_agg(
						jsonb_build_object(
							'id', t_1.technical_review_id,
							'timeAllocation', t_1.time_allocation,
							'technicalReviewAssignee', jsonb_build_object(
								'id', t_1.technical_review_assignee_id,
								'firstname', u.firstname,
								'lastname', u.lastname
							),
							'status', t_1.status,
							'submitted', t_1.submitted,
							'internalReviewers', (
								SELECT jsonb_agg(jsonb_build_object('id', ir.reviewer_id))
								FROM internal_reviews ir
								WHERE ir.technical_review_id = t_1.technical_review_id
							)
						) ORDER BY t_1.technical_review_id ASC
					) AS technical_reviews
				FROM technical_review t_1
				LEFT JOIN users u ON u.user_id = t_1.technical_review_assignee_id
				GROUP BY t_1.proposal_pk
			) t ON t.proposal_pk = p.proposal_pk
			LEFT JOIN (
				SELECT
					ihp_1.proposal_pk,
					jsonb_agg(
						jsonb_build_object(
							'id', ihp_1.instrument_id,
							'name', i.name,
							'managerUserId', i.manager_user_id,
							'managementTimeAllocation', ihp_1.management_time_allocation,
							'scientists', (
								SELECT jsonb_agg(jsonb_build_object('id', ihs.user_id))
								FROM instrument_has_scientists ihs
								WHERE ihs.instrument_id = ihp_1.instrument_id
							)
						) ORDER BY ihp_1.instrument_has_proposals_id ASC
					) AS instruments
				FROM instrument_has_proposals ihp_1
				JOIN instruments i ON i.instrument_id = ihp_1.instrument_id
				GROUP BY ihp_1.proposal_pk
			) ihp ON ihp.proposal_pk = p.proposal_pk
			ORDER BY p.proposal_pk;

			ALTER TABLE proposal_events RENAME COLUMN proposal_fap_selected TO proposal_faps_selected;
			ALTER TABLE proposal_events ADD COLUMN proposal_faps_removed BOOLEAN DEFAULT false;

			UPDATE status_changing_events
			SET status_changing_event = 'PROPOSAL_FAPS_SELECTED'
			WHERE status_changing_event = 'PROPOSAL_FAP_SELECTED';

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
