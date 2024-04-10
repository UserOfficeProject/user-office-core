DO
$$
BEGIN
	IF register_patch('0151_MultipleFapPerProposal.sql', 'martintrajanovski', 'Mutliple FAP per proposal', '2024-04-03') THEN
	BEGIN

			-- ALTER TABLE fap_proposals ADD COLUMN fap_proposals_id SERIAL NOT NULL UNIQUE;
			-- ALTER TABLE fap_proposals DROP CONSTRAINT fap_proposals_pkey;
			-- ALTER TABLE fap_proposals ADD PRIMARY KEY (fap_proposals_id);
			-- ALTER TABLE fap_proposals ALTER COLUMN fap_id DROP NOT NULL;

			-- -- drop view to allow recreating it
    	-- DROP VIEW proposal_table_view;

    	-- -- re-create newest view query with order by
		  -- CREATE VIEW proposal_table_view
		  -- AS
			-- SELECT
			-- 	p.proposal_pk,
			-- 	p.title,
			-- 	p.proposer_id AS principal_investigator,
			-- 	p.status_id AS proposal_status_id,
			-- 	ps.name AS proposal_status_name,
			-- 	ps.description AS proposal_status_description,
			-- 	p.proposal_id,
			-- 	p.final_status,
			-- 	p.notified,
			-- 	p.questionary_id,
			-- 	p.submitted,
			-- 	t.technical_reviews,
			-- 	ihp.instruments,
			-- 	ihp_2.instrument_scientist_ids,
			-- 	fp.faps,
			-- 	fp.fap_instruments,
			-- 	c.call_short_code,
			-- 	c.allocation_time_unit,
			-- 	c.call_id,
			-- 	c.proposal_workflow_id,
			-- 	(
			-- 		SELECT round(avg(fap_reviews.grade)::numeric, 2) AS round
			-- 		FROM fap_reviews
			-- 		WHERE fap_reviews.proposal_pk = p.proposal_pk
			-- 	) AS average,
			-- 	(
			-- 		SELECT round(stddev_pop(fap_reviews.grade)::numeric, 2) AS round
			-- 		FROM fap_reviews
			-- 		WHERE fap_reviews.proposal_pk = p.proposal_pk
			-- 	) AS deviation,
			-- 	fmd.rank_order
			-- FROM proposals p
			-- LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
			-- LEFT JOIN call c ON c.call_id = p.call_id
			-- LEFT JOIN (
			-- 	SELECT
			-- 		fp_1.proposal_pk,
			-- 		array_agg(
			-- 			jsonb_build_object(
			-- 				'id', f.fap_id,
			-- 				'code', f.code
			-- 			) ORDER BY fp_1.fap_proposals_id ASC
			-- 		) AS faps,
			-- 		array_agg(
			-- 			jsonb_build_object(
			-- 				'instrumentId', fp_1.instrument_id,
			-- 				'fapId', f.fap_id
			-- 			)
			-- 		) AS fap_instruments
			-- 	FROM fap_proposals fp_1
			-- 	JOIN faps f ON f.fap_id = fp_1.fap_id
			-- 	GROUP BY fp_1.proposal_pk
			-- ) fp ON fp.proposal_pk = p.proposal_pk
			-- LEFT JOIN fap_meeting_decisions fmd ON fmd.proposal_pk = p.proposal_pk
			-- LEFT JOIN (
			-- 	SELECT
			-- 		t_1.proposal_pk,
			-- 		array_agg(
			-- 			jsonb_build_object(
			-- 				'id', t_1.technical_review_id,
			-- 				'timeAllocation', t_1.time_allocation,
			-- 				'technicalReviewAsignee', jsonb_build_object(
			-- 					'id', t_1.technical_review_assignee_id,
			-- 					'firstName', u.firstname,
			-- 					'lastName', u.lastname
			-- 				),
			-- 				'status', t_1.status,
			-- 				'submitted', t_1.submitted,
			-- 				'internalTechnicalReviewerIds', ir.reviewer_id
			-- 			) ORDER BY t_1.technical_review_id ASC
			-- 		) AS technical_reviews
			-- 	FROM technical_review t_1
			-- 	LEFT JOIN users u ON u.user_id = t_1.technical_review_assignee_id
			-- 	LEFT JOIN internal_reviews ir ON ir.technical_review_id = t_1.technical_review_id
			-- 	GROUP BY t_1.proposal_pk
			-- ) t ON t.proposal_pk = p.proposal_pk
			-- LEFT JOIN (
			-- 	SELECT
			-- 		ihp_1.proposal_pk,
			-- 		array_agg(
			-- 			jsonb_build_object(
			-- 				'id', ihp_1.instrument_id,
			-- 				'name', i.name,
			-- 				'managerUserId', i.manager_user_id,
			-- 				'managementTimeAllocation', ihp_1.management_time_allocation
			-- 			) ORDER BY ihp_1.instrument_has_proposals_id ASC
			-- 		) AS instruments
			-- 	FROM instrument_has_proposals ihp_1
			-- 	JOIN instruments i ON i.instrument_id = ihp_1.instrument_id
			-- 	GROUP BY ihp_1.proposal_pk
			-- ) ihp ON ihp.proposal_pk = p.proposal_pk
			-- LEFT JOIN (
			-- 	SELECT
			-- 		ihp_2_1.proposal_pk,
			-- 		array_agg(
			-- 			ihs.user_id ORDER BY ihp_2_1.instrument_has_proposals_id
			-- 		) AS instrument_scientist_ids
			-- 	FROM instrument_has_proposals ihp_2_1
			-- 	LEFT JOIN instrument_has_scientists ihs ON ihp_2_1.instrument_id = ihs.instrument_id
			-- 	GROUP BY ihp_2_1.proposal_pk
			-- ) ihp_2 ON ihp_2.proposal_pk = p.proposal_pk
			-- ORDER BY p.proposal_pk;

			-- ALTER TABLE proposal_events RENAME COLUMN proposal_fap_selected TO proposal_faps_selected;
			-- ALTER TABLE proposal_events ADD COLUMN proposal_faps_removed BOOLEAN DEFAULT false;

			-- UPDATE status_changing_events
			-- SET status_changing_event = 'PROPOSAL_FAPS_SELECTED'
			-- WHERE status_changing_event = 'PROPOSAL_FAP_SELECTED';

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;