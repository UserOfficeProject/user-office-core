DO
$$
BEGIN
	IF register_patch('MultiInstrumentPerProposal.sql', 'martintrajanovski', 'Mutliple instrument per proposal', '2023-12-18') THEN
	BEGIN

      ALTER TABLE technical_review 
			ADD COLUMN instrument_id INT REFERENCES instruments (instrument_id) ON UPDATE CASCADE ON DELETE CASCADE;
			UPDATE technical_review
			SET instrument_id = (SELECT instrument_id FROM instrument_has_proposals WHERE technical_review.proposal_pk = instrument_has_proposals.proposal_pk);

			ALTER TABLE technical_review DROP CONSTRAINT technical_review_proposal_id_key;

			ALTER TABLE instrument_has_proposals ADD COLUMN instrument_has_proposals_id SERIAL NOT NULL;
			ALTER TABLE instrument_has_proposals ADD COLUMN management_time_allocation INT DEFAULT NULL;
			UPDATE instrument_has_proposals
			SET management_time_allocation = (SELECT management_time_allocation FROM proposals WHERE proposals.proposal_pk = instrument_has_proposals.proposal_pk);

			ALTER TABLE fap_proposals ADD COLUMN instrument_id INT REFERENCES instruments (instrument_id);
			UPDATE fap_proposals
			SET instrument_id = (SELECT instrument_id FROM instrument_has_proposals WHERE fap_proposals.proposal_pk = instrument_has_proposals.proposal_pk);

			ALTER TABLE fap_proposals ADD COLUMN fap_instrument_meeting_submitted BOOLEAN DEFAULT FALSE;
			UPDATE fap_proposals
			SET fap_instrument_meeting_submitted = (SELECT submitted FROM instrument_has_proposals WHERE fap_proposals.proposal_pk = instrument_has_proposals.proposal_pk);

			-- drop view to allow recreating it
    	DROP VIEW proposal_table_view;

    	-- re-create newest view query with order by
		  CREATE VIEW proposal_table_view
		  AS
			SELECT  p.proposal_pk AS proposal_pk,
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
		          t.technical_review_ids,
							t.technical_review_assignee_ids,
							t.technical_time_allocations,
							ihp.management_time_allocations,
		          t.technical_review_assignee_names,
		          t.technical_review_statuses,
		          t.technical_reviews_submitted,
							t.internal_technical_reviewer_ids,
							ihp.instrument_ids,
		          ihp.instrument_names,
							ihp.instrument_manager_ids,
							ihp_2.instrument_scientist_ids,
		          f.code AS fap_code,
		          f.fap_id AS fap_id,
		          fp.instrument_id AS fap_instrument_id,
							c.call_short_code,
		          c.allocation_time_unit,
		          c.call_id,
		          c.proposal_workflow_id,
		          ( SELECT round(avg("fap_reviews".grade)::numeric, 2) AS round
		                  FROM "fap_reviews"
		                  WHERE "fap_reviews".proposal_pk = p.proposal_pk) AS average,
		          ( SELECT round(stddev_pop("fap_reviews".grade)::numeric, 2) AS round
		                  FROM "fap_reviews"
		                  WHERE "fap_reviews".proposal_pk = p.proposal_pk) AS deviation,
							smd.rank_order as rank_order
		  FROM proposals p
		  LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
		  LEFT JOIN call c ON c.call_id = p.call_id
		  LEFT JOIN "fap_proposals" fp ON fp.proposal_pk = p.proposal_pk
		  LEFT JOIN "faps" f ON f.fap_id = fp.fap_id
		  LEFT JOIN "fap_meeting_decisions" smd ON smd.proposal_pk = p.proposal_pk
			LEFT JOIN (
				SELECT proposal_pk,
					array_agg(t.time_allocation ORDER BY t.technical_review_id ASC) AS technical_time_allocations,
					array_agg(t.technical_review_id ORDER BY t.technical_review_id ASC) AS technical_review_ids,
					array_agg(t.technical_review_assignee_id ORDER BY t.technical_review_id ASC) AS technical_review_assignee_ids,
					array_agg(t.status ORDER BY t.technical_review_id ASC) AS technical_review_statuses,
					array_agg(t.submitted ORDER BY t.technical_review_id ASC) AS technical_reviews_submitted,
					array_agg(u.firstname || ' ' || u.lastname ORDER BY t.technical_review_id ASC) AS technical_review_assignee_names,
					array_agg(ir.reviewer_id ORDER BY t.technical_review_id) AS internal_technical_reviewer_ids
				FROM technical_review t
				LEFT JOIN users u ON u.user_id = t.technical_review_assignee_id
				LEFT JOIN internal_reviews ir ON ir.technical_review_id = t.technical_review_id
				GROUP BY t.proposal_pk
			) t ON t.proposal_pk = p.proposal_pk
			LEFT JOIN (
				SELECT proposal_pk,
					array_agg(ihp.instrument_id ORDER BY ihp.instrument_has_proposals_id ASC) AS instrument_ids,
					array_agg(i.name ORDER BY ihp.instrument_has_proposals_id ASC) AS instrument_names,
					array_agg(i.manager_user_id ORDER BY ihp.instrument_has_proposals_id ASC) AS instrument_manager_ids,
					array_agg(ihp.management_time_allocation ORDER BY ihp.instrument_has_proposals_id ASC) AS management_time_allocations
				FROM instrument_has_proposals ihp 
				JOIN instruments i ON i.instrument_id = ihp.instrument_id
				GROUP BY ihp.proposal_pk
			) ihp ON ihp.proposal_pk = p.proposal_pk
			LEFT JOIN (
				SELECT proposal_pk,
					array_agg(ihs.user_id ORDER BY ihp_2.instrument_has_proposals_id ASC) AS instrument_scientist_ids
				FROM instrument_has_proposals ihp_2
				LEFT JOIN instrument_has_scientists ihs ON ihp_2.instrument_id = ihs.instrument_id
				GROUP BY ihp_2.proposal_pk
			) ihp_2 ON ihp_2.proposal_pk = p.proposal_pk
			ORDER BY proposal_pk;

		-- Add new events in the proposal events table.
		ALTER TABLE proposal_events ADD COLUMN proposal_all_feasibility_reviews_submitted BOOLEAN DEFAULT FALSE;
		ALTER TABLE proposal_events ADD COLUMN proposal_all_feasibility_reviews_feasible BOOLEAN DEFAULT FALSE;
		ALTER TABLE proposal_events RENAME COLUMN proposal_feasible TO proposal_feasibility_review_feasible;
		ALTER TABLE proposal_events RENAME COLUMN proposal_unfeasible TO proposal_feasibility_review_unfeasible;
		UPDATE status_changing_events
		SET status_changing_event = 'PROPOSAL_FEASIBILITY_REVIEW_FEASIBLE'
		WHERE status_changing_event = 'PROPOSAL_FEASIBLE';
		UPDATE status_changing_events
		SET status_changing_event = 'PROPOSAL_FEASIBILITY_REVIEW_UNFEASIBLE'
		WHERE status_changing_event = 'PROPOSAL_UNFEASIBLE';
		ALTER TABLE proposals DROP COLUMN management_time_allocation;
		ALTER TABLE instrument_has_proposals DROP COLUMN submitted;
		ALTER TABLE call_has_instruments DROP COLUMN submitted;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;