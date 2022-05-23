DO
$$
BEGIN
  IF register_patch('AddCallInstrumentsToProposalView.sql', 'Cosimo Campo', 'Show call instrument data in proposal view', '2022-05-16') THEN
    -- drop view to allow recreating it
    DROP VIEW proposal_table_view;

    -- re-create view with additional columns showing the ID and name of the call's assigned instrument(s),
    -- and renaming the columns for the proposal instrument ID and name for clarity
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
            c.call_short_code,
            s.code AS sep_code,
            s.sep_id AS sep_id,
            c.allocation_time_unit,
            c.call_id,
            proposal_instrument.name AS proposal_instrument_name,
            proposal_instrument.instrument_id AS proposal_instrument_id,
            call_instrument.name AS call_instrument_name,
            call_instrument.instrument_id AS call_instrument_id,
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
    LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
    LEFT JOIN call c ON c.call_id = p.call_id
    LEFT JOIN call_has_instruments chi ON chi.call_id = p.call_id
    LEFT JOIN instruments call_instrument ON call_instrument.instrument_id = chi.instrument_id
    LEFT JOIN instrument_has_proposals ihp ON ihp.proposal_pk = p.proposal_pk
    LEFT JOIN instruments proposal_instrument ON proposal_instrument.instrument_id = ihp.instrument_id
    LEFT JOIN "SEP_Proposals" sp ON sp.proposal_pk = p.proposal_pk
    LEFT JOIN "SEPs" s ON s.sep_id = sp.sep_id
    LEFT JOIN "SEP_meeting_decisions" smd ON smd.proposal_pk = p.proposal_pk;
  END IF;
END;
$$
LANGUAGE plpgsql;
