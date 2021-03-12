DO
$$
BEGIN
    IF register_patch('UpdateProposalView.sql', 'Peter Asztalos', 'Use SEP_Proposals for joining SEP', '2020-11-25') THEN

        DROP VIEW proposal_table_view;

        ALTER TABLE proposals DROP COLUMN sep_id;

        CREATE VIEW proposal_table_view
        AS
        SELECT  p.proposal_id AS id,
                p.title,
                p.status_id AS proposal_status_id,
                ps.name AS proposal_status_name,
                ps.description AS proposal_status_description,
                p.short_code,
                p.rank_order,
                p.final_status,
                p.notified,
                t.time_allocation,
                t.status AS technical_review_status,
                i.name AS instrument_name,
                c.call_short_code,
                s.code AS sep_code,
                c.call_id,
                i.instrument_id,
                ( SELECT round(avg("SEP_Reviews".grade), 1) AS round
                    FROM "SEP_Reviews"
                    WHERE "SEP_Reviews".proposal_id = p.proposal_id) AS average,
                ( SELECT round(stddev_pop("SEP_Reviews".grade), 1) AS round
                    FROM "SEP_Reviews"
                    WHERE "SEP_Reviews".proposal_id = p.proposal_id) AS deviation,
                p.submitted
        FROM proposals p
                LEFT JOIN technical_review t ON t.proposal_id = p.proposal_id
                LEFT JOIN instrument_has_proposals ihp ON ihp.proposal_id = p.proposal_id
                LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
                LEFT JOIN instruments i ON i.instrument_id = ihp.instrument_id
                LEFT JOIN call c ON c.call_id = p.call_id
                LEFT JOIN "SEP_Proposals" sp ON sp.proposal_id = p.proposal_id
                LEFT JOIN "SEPs" s ON s.sep_id = sp.sep_id;

    END IF;
END;
$$
LANGUAGE plpgsql;