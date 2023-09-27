DO
$$
BEGIN
	IF register_patch('MoveTechnicalReviewAssigneeToTechnicalReviewTableAndAddNameToProposalViewTable.sql', 'Martin Trajanovski', 'Move technical_review_assignee to the technical_review table and add techinqual review assignee name to proposal_view_table', '2022-04-28') THEN
		BEGIN
			-- drop view to modify some dependencies and add new information
			DROP VIEW proposal_table_view;

			 -- add technical_review_assignee_id column to technical_review table
			ALTER TABLE technical_review
			ADD COLUMN IF NOT EXISTS technical_review_assignee_id int DEFAULT NULL
			REFERENCES users(user_id) ON DELETE SET NULL;

			-- update technical_review_assignee_id column
			UPDATE technical_review
			SET technical_review_assignee_id = ( 
					SELECT proposals.technical_review_assignee
					FROM proposals
					WHERE proposals.proposal_pk = technical_review.proposal_pk
			);

			-- remove technical_review_assignee column from proposals table
			ALTER TABLE proposals
			DROP COLUMN IF EXISTS technical_review_assignee;

			-- re-create view with updated dependencies and new information
			CREATE VIEW proposal_table_view
			AS
			SELECT  p.proposal_pk AS proposal_pk,
							p.title,
							p.status_id AS proposal_status_id,
							ps.name AS proposal_status_name,
							ps.description AS proposal_status_description,
							p.proposal_id,
							smd.rank_order as rank_order,
							p.final_status,
							p.notified,
							p.questionary_id,
							t.time_allocation as technical_time_allocation,
							p.management_time_allocation,
							t.technical_review_assignee_id,
							u.firstname as technical_review_assignee_firstname,
							u.lastname as technical_review_assignee_lastname,
							t.status AS technical_review_status,
							t.submitted as technical_review_submitted,
							i.name AS instrument_name,
							c.call_short_code,
							s.code AS sep_code,
							s.sep_id AS sep_id,
							c.allocation_time_unit,
							c.call_id,
							i.instrument_id,
							( SELECT round(avg("SEP_Reviews".grade), 1) AS round
											FROM "SEP_Reviews"
											WHERE "SEP_Reviews".proposal_pk = p.proposal_pk) AS average,
							( SELECT round(stddev_pop("SEP_Reviews".grade), 1) AS round
											FROM "SEP_Reviews"
											WHERE "SEP_Reviews".proposal_pk = p.proposal_pk) AS deviation,
							p.submitted
			FROM proposals p
			LEFT JOIN technical_review t ON t.proposal_pk = p.proposal_pk
			LEFT JOIN users u ON u.user_id = t.technical_review_assignee_id
			LEFT JOIN instrument_has_proposals ihp ON ihp.proposal_pk = p.proposal_pk
			LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
			LEFT JOIN instruments i ON i.instrument_id = ihp.instrument_id
			LEFT JOIN call c ON c.call_id = p.call_id
			LEFT JOIN "SEP_Proposals" sp ON sp.proposal_pk = p.proposal_pk
			LEFT JOIN "SEPs" s ON s.sep_id = sp.sep_id
			LEFT JOIN "SEP_meeting_decisions" smd ON smd.proposal_pk = p.proposal_pk;
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;