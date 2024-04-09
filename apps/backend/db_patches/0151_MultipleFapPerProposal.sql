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
			-- SELECT  p.proposal_pk AS proposal_pk,
		  --         p.title,
		  --         p.proposer_id AS principal_investigator,
		  --         p.status_id AS proposal_status_id,
		  --         ps.name AS proposal_status_name,
		  --         ps.description AS proposal_status_description,
		  --         p.proposal_id,
		  --         p.final_status,
		  --         p.notified,
		  --         p.questionary_id,
			-- 				p.submitted,
		  --         t.technical_review_ids,
			-- 				t.technical_review_assignee_ids,
			-- 				t.technical_time_allocations,
			-- 				ihp.management_time_allocations,
		  --         t.technical_review_assignee_names,
		  --         t.technical_review_statuses,
		  --         t.technical_reviews_submitted,
			-- 				t.internal_technical_reviewer_ids,
			-- 				ihp.instrument_ids,
		  --         ihp.instrument_names,
			-- 				ihp.instrument_manager_ids,
			-- 				ihp_2.instrument_scientist_ids,
			-- 				fp.fap_ids as fap_ids,
			-- 				fp.fap_codes as fap_codes,
		  --         fp.instrument_ids AS fap_instrument_ids,
			--				fp.fap_instruments,
			-- 				c.call_short_code,
		  --         c.allocation_time_unit,
		  --         c.call_id,
		  --         c.proposal_workflow_id,
		  --         ( SELECT round(avg(fap_reviews.grade)::numeric, 2) AS round
		  --                 FROM fap_reviews
		  --                 WHERE fap_reviews.proposal_pk = p.proposal_pk) AS average,
		  --         ( SELECT round(stddev_pop(fap_reviews.grade)::numeric, 2) AS round
		  --                 FROM fap_reviews
		  --                 WHERE fap_reviews.proposal_pk = p.proposal_pk) AS deviation,
			-- 				fmd.rank_order as rank_order
		  -- FROM proposals p
		  -- LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
		  -- LEFT JOIN call c ON c.call_id = p.call_id
			-- LEFT JOIN (
			-- 	SELECT proposal_pk,
			-- 		array_agg(f.fap_id ORDER BY fp.fap_proposals_id ASC) AS fap_ids,
			-- 		array_agg(f.code ORDER BY fp.fap_proposals_id ASC) AS fap_codes,
			-- 		array_agg(fp.instrument_id ORDER BY fp.fap_proposals_id ASC) AS instrument_ids
			--		array_agg(jsonb_build_object('instrumentId', fp_1.instrument_id, 'fapId', f.fap_id )) AS fap_instruments
			-- 	FROM fap_proposals fp 
			-- 	JOIN faps f ON f.fap_id = fp.fap_id
			-- 	GROUP BY fp.proposal_pk
			-- ) fp ON fp.proposal_pk = p.proposal_pk
		  -- LEFT JOIN fap_meeting_decisions fmd ON fmd.proposal_pk = p.proposal_pk
			-- LEFT JOIN (
			-- 	SELECT proposal_pk,
			-- 		array_agg(t.time_allocation ORDER BY t.technical_review_id ASC) AS technical_time_allocations,
			-- 		array_agg(t.technical_review_id ORDER BY t.technical_review_id ASC) AS technical_review_ids,
			-- 		array_agg(t.technical_review_assignee_id ORDER BY t.technical_review_id ASC) AS technical_review_assignee_ids,
			-- 		array_agg(t.status ORDER BY t.technical_review_id ASC) AS technical_review_statuses,
			-- 		array_agg(t.submitted ORDER BY t.technical_review_id ASC) AS technical_reviews_submitted,
			-- 		array_agg(u.firstname || ' ' || u.lastname ORDER BY t.technical_review_id ASC) AS technical_review_assignee_names,
			-- 		array_agg(ir.reviewer_id ORDER BY t.technical_review_id) AS internal_technical_reviewer_ids
			-- 	FROM technical_review t
			-- 	LEFT JOIN users u ON u.user_id = t.technical_review_assignee_id
			-- 	LEFT JOIN internal_reviews ir ON ir.technical_review_id = t.technical_review_id
			-- 	GROUP BY t.proposal_pk
			-- ) t ON t.proposal_pk = p.proposal_pk
			-- LEFT JOIN (
			-- 	SELECT proposal_pk,
			-- 		array_agg(ihp.instrument_id ORDER BY ihp.instrument_has_proposals_id ASC) AS instrument_ids,
			-- 		array_agg(i.name ORDER BY ihp.instrument_has_proposals_id ASC) AS instrument_names,
			-- 		array_agg(i.manager_user_id ORDER BY ihp.instrument_has_proposals_id ASC) AS instrument_manager_ids,
			-- 		array_agg(ihp.management_time_allocation ORDER BY ihp.instrument_has_proposals_id ASC) AS management_time_allocations
			-- 	FROM instrument_has_proposals ihp 
			-- 	JOIN instruments i ON i.instrument_id = ihp.instrument_id
			-- 	GROUP BY ihp.proposal_pk
			-- ) ihp ON ihp.proposal_pk = p.proposal_pk
			-- LEFT JOIN (
			-- 	SELECT proposal_pk,
			-- 		array_agg(ihs.user_id ORDER BY ihp_2.instrument_has_proposals_id ASC) AS instrument_scientist_ids
			-- 	FROM instrument_has_proposals ihp_2
			-- 	LEFT JOIN instrument_has_scientists ihs ON ihp_2.instrument_id = ihs.instrument_id
			-- 	GROUP BY ihp_2.proposal_pk
			-- ) ihp_2 ON ihp_2.proposal_pk = p.proposal_pk
			-- ORDER BY proposal_pk;

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