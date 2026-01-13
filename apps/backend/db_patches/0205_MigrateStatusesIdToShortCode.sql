DO
$$
DECLARE
    -- Variable to hold count of affected rows for logging/verification
    v_count bigint;
BEGIN
    IF register_patch(
       '0205_MigrateStatusesIdToShortCode',
       'Jekabs Karklins',
       'Move short_code for statuses table to be the primary key (renaming it to status_id) and update references.',
       '2026-01-12'
     ) THEN
      BEGIN

        -- ==========================================
        -- 0. Drop Dependent Views
        -- ==========================================
        -- 'proposal_table_view' depends on proposals.status_id and statuses.status_id
        -- 'review_data' depends on proposals.status_id
        -- We drop them now and recreate them at the end with the new schema types.
        DROP VIEW IF EXISTS proposal_table_view;
        DROP VIEW IF EXISTS review_data;


        -- ==========================================
        -- 1. Prepare 'statuses' table
        -- ==========================================
        
        -- Drop the existing primary key constraint on statuses.status_id
        -- We will re-add it later on the new text column
        -- CASCADE should drop FKs from other tables referencing this PK
        ALTER TABLE statuses DROP CONSTRAINT proposal_statuses_pkey CASCADE;

        -- Rename existing columns to prepare for the swap
        -- status_id (int) -> old_id
        ALTER TABLE statuses RENAME COLUMN status_id TO old_id;
        
        -- short_code (varchar) -> status_id
        ALTER TABLE statuses RENAME COLUMN short_code TO status_id;

        -- Ensure the new status_id is not null and unique (it should be if it's becoming PK)
        ALTER TABLE statuses ALTER COLUMN status_id SET NOT NULL;
        
        -- Make it the Primary Key
        ALTER TABLE statuses ADD PRIMARY KEY (status_id);


        -- ==========================================
        -- 2. Migrate 'workflow_has_statuses'
        -- ==========================================

        -- Add temporary column
        ALTER TABLE workflow_has_statuses ADD COLUMN new_status_id VARCHAR(50);

        -- Populate new column using the join on the old ID
        UPDATE workflow_has_statuses whs
        SET new_status_id = s.status_id
        FROM statuses s
        WHERE whs.status_id = s.old_id;

        -- Drop old column
        ALTER TABLE workflow_has_statuses DROP COLUMN status_id;

        -- Rename new column
        ALTER TABLE workflow_has_statuses RENAME COLUMN new_status_id TO status_id;
        ALTER TABLE workflow_has_statuses ALTER COLUMN status_id SET NOT NULL;

        -- Add Foreign Key
        ALTER TABLE workflow_has_statuses
            ADD CONSTRAINT fk_whs_status FOREIGN KEY (status_id) REFERENCES statuses (status_id) ON UPDATE CASCADE ON DELETE CASCADE;


        -- ==========================================
        -- 3. Migrate 'experiment_safety'
        -- ==========================================

        ALTER TABLE experiment_safety ADD COLUMN new_status_id VARCHAR(50);

        UPDATE experiment_safety es
        SET new_status_id = s.status_id
        FROM statuses s
        WHERE es.status_id = s.old_id;

        ALTER TABLE experiment_safety DROP COLUMN status_id;
        ALTER TABLE experiment_safety RENAME COLUMN new_status_id TO status_id;
        -- ALTER TABLE experiment_safety ALTER COLUMN status_id SET NOT NULL; -- User requested nullable

        ALTER TABLE experiment_safety
            ADD CONSTRAINT experiment_safety_status_id_fkey FOREIGN KEY (status_id) REFERENCES statuses (status_id) ON UPDATE CASCADE;


        -- ==========================================
        -- 4. Migrate 'proposals'
        -- ==========================================

        ALTER TABLE proposals ADD COLUMN new_status_id VARCHAR(50);

        -- Map existing valid status IDs
        UPDATE proposals p
        SET new_status_id = s.status_id
        FROM statuses s
        WHERE p.status_id = s.old_id;


        -- Clean up old column
        ALTER TABLE proposals DROP COLUMN status_id;
        ALTER TABLE proposals RENAME COLUMN new_status_id TO status_id;
        
        -- Set new default
        ALTER TABLE proposals ALTER COLUMN status_id SET DEFAULT 'DRAFT';
        ALTER TABLE proposals ALTER COLUMN status_id SET NOT NULL;

        -- Re-add Foreign Key
        ALTER TABLE proposals
            ADD CONSTRAINT proposals_status_id_fkey FOREIGN KEY (status_id) REFERENCES statuses (status_id) ON UPDATE CASCADE;


        -- ==========================================
        -- 5. Migrate 'workflow_status_actions'
        -- ==========================================
        -- Checking if table exists and column exists (it should based on schema history)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_status_actions') THEN
             
             -- Check for 'proposal_status_id' (legacy name)
             IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_status_actions' AND column_name = 'proposal_status_id') THEN
                
                ALTER TABLE workflow_status_actions ADD COLUMN new_status_id VARCHAR(50);
                
                UPDATE workflow_status_actions wsa
                SET new_status_id = s.status_id
                FROM statuses s
                WHERE wsa.proposal_status_id = s.old_id;
                
                ALTER TABLE workflow_status_actions DROP COLUMN proposal_status_id;
                
                -- Standardize on 'status_id'
                ALTER TABLE workflow_status_actions RENAME COLUMN new_status_id TO status_id;
                ALTER TABLE workflow_status_actions ALTER COLUMN status_id SET NOT NULL;

                ALTER TABLE workflow_status_actions
                    ADD CONSTRAINT fk_wsa_status FOREIGN KEY (status_id) REFERENCES statuses (status_id) ON UPDATE CASCADE ON DELETE CASCADE;

             -- Check if it was already 'status_id'
             ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_status_actions' AND column_name = 'status_id') THEN
             
                ALTER TABLE workflow_status_actions ADD COLUMN new_status_id VARCHAR(50);
                
                UPDATE workflow_status_actions wsa
                SET new_status_id = s.status_id
                FROM statuses s
                WHERE wsa.status_id = s.old_id;
                
                ALTER TABLE workflow_status_actions DROP COLUMN status_id;
                ALTER TABLE workflow_status_actions RENAME COLUMN new_status_id TO status_id;
                ALTER TABLE workflow_status_actions ALTER COLUMN status_id SET NOT NULL;
                
                ALTER TABLE workflow_status_actions
                    ADD CONSTRAINT fk_wsa_status FOREIGN KEY (status_id) REFERENCES statuses (status_id) ON UPDATE CASCADE ON DELETE CASCADE;

             END IF;
        END IF;


        -- ==========================================
        -- 6. Cleanup 'statuses'
        -- ==========================================
        
        -- Drop the old integer ID column
        ALTER TABLE statuses DROP COLUMN old_id;


        -- ==========================================
        -- 7. Recreate 'proposal_table_view'
        -- ==========================================
        -- Copied from 0184_AddMultipleTechReviewsEnabledToInstInPropsalTableView.sql
        
        CREATE VIEW proposal_table_view AS
        SELECT
            p.proposal_pk,
            p.title,
            p.proposer_id AS principal_investigator,
            p.status_id AS proposal_status_id,
            s.name AS proposal_status_name,
            s.description AS proposal_status_description,
            p.proposal_id,
            p.final_status,
            p.notified,
            p.questionary_id,
            p.submitted,
            p.submitted_date,
            t.technical_reviews,
            ihp.instruments,
            fp.faps,
            fp.fap_instruments,
            c.call_short_code,
            c.allocation_time_unit,
            c.call_id,
            c.proposal_workflow_id
        FROM proposals p
        LEFT JOIN statuses s ON s.status_id = p.status_id
        LEFT JOIN call c ON c.call_id = p.call_id
        LEFT JOIN (
            SELECT
                fp_1.proposal_pk,
                jsonb_agg(
                    jsonb_build_object(
                        'id', f.fap_id,
                        'code', f.code
                    ) ORDER BY fp_1.fap_proposal_id ASC
                ) AS faps,
                jsonb_agg(
                    jsonb_build_object(
                        'instrumentId', fp_1.instrument_id,
                        'fapId', f.fap_id
                    )
                ) AS fap_instruments
            FROM fap_proposals fp_1
            JOIN faps f ON f.fap_id = fp_1.fap_id
            GROUP BY fp_1.proposal_pk
        ) fp ON fp.proposal_pk = p.proposal_pk
        LEFT JOIN (
            SELECT
                t_1.proposal_pk,
                jsonb_agg(
                    jsonb_build_object(
                        'id', t_1.technical_review_id,
                        'timeAllocation', t_1.time_allocation,
                        'technicalReviewAssignee', (
                            SELECT jsonb_build_object(
                                'id', u.user_id,
                                'firstname', u.firstname,
                                'lastname', u.lastname
                            )
                            FROM users u
                            WHERE u.user_id = t_1.technical_review_assignee_id
                        ),
                        'status', t_1.status,
                        'submitted', t_1.submitted,
                        'internalReviewers', (
                            SELECT jsonb_agg(jsonb_build_object('id', ir.reviewer_id))
                            FROM internal_reviews ir
                            WHERE ir.technical_review_id = t_1.technical_review_id
                        ),
                        'instrumentId', t_1.instrument_id
                    ) ORDER BY t_1.technical_review_id ASC
                ) AS technical_reviews
            FROM technical_review t_1
            GROUP BY t_1.proposal_pk
        ) t ON t.proposal_pk = p.proposal_pk
        LEFT JOIN (
            SELECT
                ihp_1.proposal_pk,
                jsonb_agg(
                    jsonb_build_object(
                        'id', ihp_1.instrument_id,
                        'name', i.name,
                        'managerUserId', i.manager_user_id,
                        'managementTimeAllocation', ihp_1.management_time_allocation,
                        'multipleTechReviewsEnabled', i.multiple_tech_reviews_enabled,
                        'scientists', (
                            SELECT jsonb_agg(jsonb_build_object('id', ihs.user_id))
                            FROM instrument_has_scientists ihs
                            WHERE ihs.instrument_id = ihp_1.instrument_id
                        )
                    ) ORDER BY ihp_1.instrument_has_proposals_id ASC
                ) AS instruments
            FROM instrument_has_proposals ihp_1
            JOIN instruments i ON i.instrument_id = ihp_1.instrument_id
            GROUP BY ihp_1.proposal_pk
        ) ihp ON ihp.proposal_pk = p.proposal_pk;



        -- ==========================================
        -- 8. Recreate 'review_data'
        -- ==========================================
        -- Copied from 0200_ChangeFapGradeToString.sql
        -- Updated WHERE clause for status_id strings (9->EXPIRED, 1->DRAFT)

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
            LEFT JOIN fap_meeting_decisions fmd ON fmd.proposal_pk = p.proposal_pk
            JOIN call_has_instruments chi ON chi.instrument_id = fp.instrument_id
                AND chi.call_id = c.call_id
            JOIN instruments i ON i.instrument_id = chi.instrument_id
            WHERE p.status_id <> 'EXPIRED'
            AND p.status_id <> 'DRAFT'
        ) proposal
        LEFT JOIN (
            SELECT
                fr.proposal_pk,
                AVG(
                    CASE
                        WHEN fr.grade ~ '^\d+(\.\d+)?$' THEN fr.grade::double precision
                        ELSE NULL
                    END
                ) AS avg
            FROM fap_proposals fp
            JOIN fap_reviews fr ON fr.proposal_pk = fp.proposal_pk
            GROUP BY fr.proposal_pk
        ) grade ON grade.proposal_pk = proposal.proposal_pk;


      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
