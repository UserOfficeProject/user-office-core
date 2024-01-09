DO
$$
BEGIN
	IF register_patch('MultiInstrumentPerProposal.sql', 'martintrajanovski', 'Mutliple instrument per proposal', '2023-12-18') THEN
	BEGIN
		-- newest view query with order by
		-- 	SELECT  p.proposal_pk AS proposal_pk,
		--           p.title,
		--           p.proposer_id AS principal_investigator,
		--           p.status_id AS proposal_status_id,
		--           ps.name AS proposal_status_name,
		--           ps.description AS proposal_status_description,
		--           p.proposal_id,
		--           p.final_status,
		--           p.notified,
		--           p.questionary_id,
		--           p.management_time_allocation,
		-- 		p.submitted,
		--           t.technical_review_ids,
		-- 		t.technical_review_assignee_ids,
		-- 		t.technical_time_allocations,
		--           t.technical_review_assignee_names,
		--           t.technical_review_statuses,
		--           t.technical_reviews_submitted,
		-- 		ihp.instrument_ids,
		--           ihp.instrument_names,
		--           s.code AS sep_code,
		--           s.fap_id AS sep_id,
		-- 		c.call_short_code,
		--           c.allocation_time_unit,
		--           c.call_id,
		--           c.proposal_workflow_id,
		--           ( SELECT round(avg("fap_reviews".grade)::numeric, 2) AS round
		--                   FROM "fap_reviews"
		--                   WHERE "fap_reviews".proposal_pk = p.proposal_pk) AS average,
		--           ( SELECT round(stddev_pop("fap_reviews".grade)::numeric, 2) AS round
		--                   FROM "fap_reviews"
		--                   WHERE "fap_reviews".proposal_pk = p.proposal_pk) AS deviation,
		-- 		smd.rank_order as rank_order
		--   FROM proposals p
		--   LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
		--   LEFT JOIN call c ON c.call_id = p.call_id
		--   LEFT JOIN "fap_proposals" sp ON sp.proposal_pk = p.proposal_pk
		--   LEFT JOIN "faps" s ON s.fap_id = sp.fap_id
		--   LEFT JOIN "fap_meeting_decisions" smd ON smd.proposal_pk = p.proposal_pk
		-- LEFT JOIN (
		-- 	SELECT proposal_pk,
		-- 		array_agg(t.time_allocation ORDER BY t.technical_review_id ASC) AS technical_time_allocations,
		-- 		array_agg(t.technical_review_id ORDER BY t.technical_review_id ASC) AS technical_review_ids,
		-- 		array_agg(t.technical_review_assignee_id ORDER BY t.technical_review_id ASC) AS technical_review_assignee_ids,
		-- 		array_agg(t.status ORDER BY t.technical_review_id ASC) AS technical_review_statuses,
		-- 		array_agg(t.submitted ORDER BY t.technical_review_id ASC) AS technical_reviews_submitted,
		-- 		array_agg(u.firstname || ' ' || u.lastname ORDER BY t.technical_review_id ASC) AS technical_review_assignee_names
		-- 	FROM technical_review t
		-- 	LEFT JOIN users u ON u.user_id = t.technical_review_assignee_id
		-- 	GROUP BY t.proposal_pk
		-- ) t ON t.proposal_pk = p.proposal_pk
		-- LEFT JOIN (
		-- 	SELECT proposal_pk,
		-- 		array_agg(ihp.instrument_id) AS instrument_ids,
		-- 		array_agg(i.name) AS instrument_names
		-- 	FROM instrument_has_proposals ihp 
		-- 	JOIN instruments i ON i.instrument_id = ihp.instrument_id
		-- 	GROUP BY ihp.proposal_pk
		-- ) ihp ON ihp.proposal_pk = p.proposal_pk;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;