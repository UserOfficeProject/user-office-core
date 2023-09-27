DO
$$
BEGIN
	IF register_patch('AddManagementAllocationTimeToProposalViewTable.sql', 'martintrajanovski', 'Add proposal management allocation time to proposal_view_table', '2021-11-02') THEN
		BEGIN
			DROP VIEW proposal_table_view;

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
							t.status AS technical_review_status,
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