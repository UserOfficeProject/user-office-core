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

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;