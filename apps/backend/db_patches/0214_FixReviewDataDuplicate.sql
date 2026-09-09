DO
$$
BEGIN
    IF register_patch(
       'FixReviewDataDuplicate',
       'Zachary Hankin',
       'Fix review_data view bug on fap_meeting_decisions join without instrument_id filter.',
       '2026-08-21'
     ) THEN
      BEGIN

        DROP VIEW IF EXISTS review_data;

        CREATE VIEW review_data AS
        SELECT
            proposal.proposal_pk,
            proposal.proposal_id,
            proposal.title,
            proposal.instrument_name,
            proposal.availability_time,
            proposal.time_allocation,
            proposal.fap_id,
            proposal.rank_order,
            proposal.call_id,
            proposal.proposer_id,
            proposal.instrument_id,
            proposal.fap_time_allocation,
            proposal.questionary_id,
            grade.avg AS average_grade,
            proposal.public_comment AS comment
        FROM (
            SELECT
                fp.proposal_pk,
                p.proposal_id,
                p.title,
                i.name AS instrument_name,
                chi.availability_time,
                tr.time_allocation,
                f.fap_id,
                fmd.rank_order,
                c.call_id,
                p.proposer_id,
                i.instrument_id,
                fp.fap_time_allocation,
                p.questionary_id,
                tr.public_comment
            FROM fap_proposals fp
            JOIN faps f ON f.fap_id = fp.fap_id
            JOIN call c ON c.call_id = fp.call_id
            JOIN proposals p ON p.proposal_pk = fp.proposal_pk
            JOIN technical_review tr ON tr.proposal_pk = p.proposal_pk
                AND tr.instrument_id = fp.instrument_id
            JOIN call_has_instruments chi ON chi.instrument_id = fp.instrument_id
                AND chi.call_id = c.call_id
            JOIN instruments i ON i.instrument_id = chi.instrument_id
            LEFT JOIN fap_meeting_decisions fmd ON fmd.proposal_pk = p.proposal_pk
                AND fmd.instrument_id = i.instrument_id
            LEFT JOIN workflow_has_statuses whs ON whs.workflow_status_id = p.workflow_status_id
            WHERE whs.status_id <> 'EXPIRED'
            AND whs.status_id <> 'DRAFT'
        ) proposal
                LEFT JOIN ( SELECT fr.proposal_pk,
                        avg(CASE 
                        WHEN fr.grade ~ '^\d+(\.\d+)\?$' THEN fr.grade::double precision
                        ELSE NULL
                    END) AS avg
            FROM fap_proposals fp
            JOIN fap_reviews fr ON fr.proposal_pk = fp.proposal_pk
            GROUP BY fr.proposal_pk
        ) grade ON grade.proposal_pk = proposal.proposal_pk;


      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
