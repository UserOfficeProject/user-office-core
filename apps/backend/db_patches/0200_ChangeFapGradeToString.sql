DO
$$
BEGIN
	IF register_patch('ChangeFapGradeToString.sql', 'TCMeldrum', 'Make grade a string for FAPs', '2025-09-04') THEN
        BEGIN
    	
            DROP VIEW review_data;

            ALTER TABLE fap_reviews 
                        ALTER COLUMN grade type varchar(30);

            CREATE OR REPLACE VIEW public.review_data
            AS SELECT proposal.proposal_pk,
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
            FROM ( SELECT fp.proposal_pk,
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
                        JOIN technical_review tr ON tr.proposal_pk = p.proposal_pk AND tr.instrument_id = fp.instrument_id
                        LEFT JOIN fap_meeting_decisions fmd ON fmd.proposal_pk = p.proposal_pk
                        JOIN call_has_instruments chi ON chi.instrument_id = fp.instrument_id AND chi.call_id = c.call_id
                        JOIN instruments i ON i.instrument_id = chi.instrument_id
                    WHERE p.status_id <> 9 AND p.status_id <> 1) proposal
                LEFT JOIN ( SELECT fr.proposal_pk,
                        avg(CASE 
                        WHEN fr.grade ~ '^\d+(\.\d+)\?$' THEN fr.grade::double precision
                        ELSE NULL
                    END) AS avg
                    FROM fap_proposals fp
                        JOIN fap_reviews fr ON fr.proposal_pk = fp.proposal_pk
                    GROUP BY fr.proposal_pk) grade ON grade.proposal_pk = proposal.proposal_pk;
                

            UPDATE questions SET default_config = jsonb_set(default_config, '{maxGrade}', '10', true) WHERE question_id = 'fap_review_basis';
            UPDATE questions SET default_config = jsonb_set(default_config, '{minGrade}', '1', true) WHERE question_id = 'fap_review_basis';
            UPDATE questions SET default_config = jsonb_set(default_config, '{decimalPoints}', '0', true) WHERE question_id = 'fap_review_basis';
            UPDATE templates_has_questions SET config = jsonb_set(config, '{maxGrade}', '10', true) WHERE question_id = 'fap_review_basis';
            UPDATE templates_has_questions SET config = jsonb_set(config, '{minGrade}', '1', true) WHERE question_id = 'fap_review_basis';
            UPDATE templates_has_questions SET config = jsonb_set(config, '{decimalPoints}', '0', true) WHERE question_id = 'fap_review_basis';

            DELETE FROM settings WHERE settings_id = 'GRADE_PRECISION';
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;