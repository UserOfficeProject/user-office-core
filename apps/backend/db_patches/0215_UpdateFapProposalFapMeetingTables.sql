DO
$$
BEGIN
	IF register_patch('UpdateFapProposalFapMeetingTables.sql', 'TCMeldrum', 'Update FapProposal and FapMeeting tables', '2026-09-23') THEN
	BEGIN

		ALTER TABLE fap_meeting_decisions
			ADD COLUMN IF NOT EXISTS recommended_time_allocation integer;

        ALTER TABLE fap_meeting_decisions
			ADD COLUMN IF NOT EXISTS fap_proposal_id integer;

        UPDATE fap_meeting_decisions AS fmd
            SET fap_proposal_id = fp.fap_proposal_id
            FROM fap_proposals AS fp
            WHERE fmd.proposal_pk = fp.proposal_pk
            AND fmd.instrument_id = fp.instrument_id;

		UPDATE fap_meeting_decisions AS fmd
			SET recommended_time_allocation = fp.fap_time_allocation
			FROM fap_proposals AS fp
			WHERE fmd.fap_proposal_id = fp.fap_proposal_id;

		ALTER TABLE fap_meeting_decisions
			ADD COLUMN IF NOT EXISTS recommended_time_allocation integer;

        ALTER TABLE fap_meeting_decisions DROP CONSTRAINT fap_meeting_decisions_pkey;
        ALTER TABLE fap_meeting_decisions ADD PRIMARY KEY (fap_proposal_id);

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
            proposal.recommended_time_allocation,
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
                fmd.recommended_time_allocation,
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
            LEFT JOIN fap_meeting_decisions fmd ON fmd.fap_proposal_id = fp.fap_proposal_id
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



		ALTER TABLE fap_proposals DROP COLUMN IF EXISTS recommended_time_allocation;
		ALTER TABLE fap_proposals DROP COLUMN IF EXISTS instrument_has_proposals_id;

        ALTER TABLE fap_meeting_decisions RENAME COLUMN instrument_id TO recommended_instrument_id;


    END;
	END IF;
END;
$$
LANGUAGE plpgsql;