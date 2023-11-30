DO
$$
BEGIN
	IF register_patch('RenameSEPToFAP.sql', 'martintrajanovski', 'Rename all tables and columns that used sep to fap(facility access panels)', '2023-11-17') THEN
	BEGIN

    ALTER TABLE "SEPs" RENAME TO faps;
    ALTER TABLE faps RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE faps RENAME COLUMN sep_chair_user_id TO fap_chair_user_id;
    ALTER TABLE faps RENAME COLUMN sep_secretary_user_id TO fap_secretary_user_id;
    ALTER TABLE faps RENAME CONSTRAINT "SEPs_pkey" TO faps_pkey;
    ALTER TABLE faps RENAME CONSTRAINT "SEPs_sep_chair_user_id_fkey" TO faps_fap_chair_user_id_fkey;
    ALTER TABLE faps RENAME CONSTRAINT "SEPs_sep_secretary_user_id_fkey" TO faps_fap_secretary_user_id_fkey;

    ALTER TABLE "SEP_Assignments" RENAME TO fap_assignments;
    ALTER TABLE fap_assignments RENAME COLUMN sep_member_user_id TO fap_member_user_id;
    ALTER TABLE fap_assignments RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE fap_assignments RENAME CONSTRAINT "SEP_Assignments_pkey" TO fap_assignments_pkey;
    ALTER TABLE fap_assignments RENAME CONSTRAINT "SEP_Assignments_proposal_id_fkey" TO fap_assignments_proposal_pk_fkey;
    ALTER TABLE fap_assignments RENAME CONSTRAINT "SEP_Assignments_sep_id_fkey" TO fap_assignments_fap_id_fkey;
    ALTER TABLE fap_assignments RENAME CONSTRAINT "SEP_Assignments_sep_member_user_id_fkey" TO fap_assignments_fap_member_user_id_fkey;
    ALTER TABLE fap_assignments DROP CONSTRAINT IF EXISTS "SEP_Assignments_sep_id_fkey1";

    ALTER TABLE "SEP_Proposals" RENAME TO fap_proposals;
    ALTER TABLE fap_proposals RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE fap_proposals RENAME COLUMN sep_time_allocation TO fap_time_allocation;
    ALTER TABLE fap_proposals RENAME CONSTRAINT "SEP_Proposals_pkey" TO fap_proposals_pkey;
    ALTER TABLE fap_proposals RENAME CONSTRAINT "SEP_Proposals_proposal_id_fkey" TO fap_proposals_proposal_pk_fkey;
    ALTER TABLE fap_proposals RENAME CONSTRAINT "SEP_Proposals_sep_id_fkey" TO fap_proposals_fap_id_fkey;

    ALTER TABLE "SEP_Reviewers" RENAME TO fap_reviewers;
    ALTER TABLE fap_reviewers RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE fap_reviewers RENAME CONSTRAINT "SEP_Reviewers_pkey" TO fap_reviewers_pkey;
    ALTER TABLE fap_reviewers RENAME CONSTRAINT "SEP_Reviewers_sep_id_fkey" TO fap_reviewers_fap_id_fkey;
    ALTER TABLE fap_reviewers RENAME CONSTRAINT "SEP_Reviewers_user_id_fkey" TO fap_reviewers_user_id_fkey;

    ALTER TABLE "SEP_Reviews" RENAME TO fap_reviews;
    ALTER TABLE fap_reviews RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE fap_reviews RENAME CONSTRAINT "prop_user_pkey" TO fap_reviews_pkey;
    ALTER TABLE fap_reviews RENAME CONSTRAINT "SEP_Reviews_sep_id_fkey" TO fap_Reviews_fap_id_fkey;
    ALTER TABLE fap_reviews RENAME CONSTRAINT "reviews_proposal_id_fkey" TO fap_reviews_proposal_pk_fkey;
    ALTER TABLE fap_reviews RENAME CONSTRAINT "reviews_user_id_fkey" TO fap_reviews_user_id_fkey;

    ALTER TABLE "SEP_meeting_decisions" RENAME TO fap_meeting_decisions;
    ALTER TABLE fap_meeting_decisions RENAME CONSTRAINT "SEP_meeting_decisions_pkey" TO fap_meeting_decisions_pkey;
    ALTER TABLE fap_meeting_decisions RENAME CONSTRAINT "SEP_meeting_decisions_proposal_id_fkey" TO fap_meeting_decisions_proposal_pk_fkey;
    ALTER TABLE fap_meeting_decisions RENAME CONSTRAINT "SEP_meeting_decisions_submitted_by_fkey" TO fap_meeting_decisions_submitted_by_fkey;

    ALTER TABLE call_has_seps RENAME TO call_has_faps;
    ALTER TABLE call_has_faps RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE call_has_faps RENAME CONSTRAINT "call_has_seps_pkey" TO call_has_faps_pkey;
    ALTER TABLE call_has_faps RENAME CONSTRAINT "call_has_seps_call_id_fkey" TO call_has_faps_call_id_fkey;
    ALTER TABLE call_has_faps RENAME CONSTRAINT "call_has_seps_sep_id_fkey" TO call_has_faps_fap_id_fkey;

    ALTER TABLE call_has_instruments RENAME COLUMN sep_id TO fap_id;
    ALTER TABLE call_has_instruments RENAME CONSTRAINT "call_has_instruments_sep_id_fkey" TO call_has_instruments_fap_id_fkey;

    ALTER TABLE "call" RENAME COLUMN start_sep_review TO start_fap_review;
    ALTER TABLE "call" RENAME COLUMN end_sep_review TO end_fap_review;
    ALTER TABLE "call" RENAME COLUMN call_sep_review_ended TO call_fap_review_ended;

    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_selected TO proposal_fap_selected;
    ALTER TABLE proposal_events RENAME COLUMN proposal_all_sep_reviewers_selected TO proposal_all_fap_reviewers_selected;
    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_review_submitted TO proposal_fap_review_submitted;
    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_meeting_submitted TO proposal_fap_meeting_submitted;
    ALTER TABLE proposal_events RENAME COLUMN call_sep_review_ended TO call_fap_review_ended;
    ALTER TABLE proposal_events RENAME COLUMN proposal_all_sep_reviews_submitted TO proposal_all_fap_reviews_submitted;
    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_review_updated TO proposal_fap_review_updated;
    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_meeting_saved TO proposal_fap_meeting_saved;
    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_meeting_ranking_overwritten TO proposal_fap_meeting_ranking_overwritten;
    ALTER TABLE proposal_events RENAME COLUMN proposal_sep_meeting_reorder TO proposal_fap_meeting_reorder;

    ALTER TABLE proposal_table_view RENAME COLUMN sep_code TO fap_code;
    ALTER TABLE proposal_table_view RENAME COLUMN sep_id TO fap_id;

    ALTER SEQUENCE "SEPs_sep_id_seq" RENAME TO "faps_fap_id_seq";

    UPDATE features
    SET feature_id = 'FAP_REVIEW', description = 'FAP (facility access panels) functionality'
    WHERE feature_id = 'SEP_REVIEW';

    UPDATE roles
    SET short_code = 'fap_chair', title = 'FAP Chair'
    WHERE short_code = 'sep_chair';
    UPDATE roles
    SET short_code = 'fap_secretary', title = 'FAP Secretary'
    WHERE short_code = 'sep_secretary';
    UPDATE roles
    SET short_code = 'fap_reviewer', title = 'FAP Reviewer'
    WHERE short_code = 'sep_reviewer';

    -- Replace SEP with FAP in the status_changing_events
    WITH sce_subquery AS (
        SELECT status_changing_event_id, status_changing_event
        FROM  status_changing_events
        WHERE status_changing_event LIKE '%SEP%'
    )
    UPDATE status_changing_events
    SET status_changing_event = REPLACE(status_changing_events.status_changing_event, 'SEP', 'FAP')
    FROM sce_subquery
    WHERE status_changing_events.status_changing_event_id = sce_subquery.status_changing_event_id;
    --

    -- Replace SEP with FAP in the proposal_statuses
    WITH ps_subquery AS (
        SELECT proposal_status_id, name, description, short_code
        FROM  proposal_statuses
        WHERE short_code LIKE '%SEP%'
    )
    UPDATE proposal_statuses
    SET name = REPLACE(proposal_statuses.name, 'SEP', 'FAP'),
        description = REPLACE(proposal_statuses.description, 'SEP', 'FAP'),
        short_code = REPLACE(proposal_statuses.short_code, 'SEP', 'FAP')
    FROM ps_subquery
    WHERE proposal_statuses.proposal_status_id = ps_subquery.proposal_status_id;
    -- 

     -- Replace SEP with FAP in the event_logs
    WITH el_subquery AS (
        SELECT id, event_type, description, row_data
        FROM  event_logs
        WHERE event_type LIKE '%SEP%'
        OR row_data LIKE '%SEP%'
    )
    UPDATE event_logs
    SET event_type = REPLACE(event_logs.event_type, 'SEP', 'FAP'),
        description = REPLACE(event_logs.description, 'SEP', 'FAP'),
        row_data = REPLACE(REPLACE(event_logs.row_data, 'SEP', 'FAP'), 'sep', 'fap')
    FROM el_subquery
    WHERE event_logs.id = el_subquery.id;
    -- 

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;