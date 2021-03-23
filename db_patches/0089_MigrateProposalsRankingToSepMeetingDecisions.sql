DO
$$
DECLARE 
   t_row proposals%rowType;
BEGIN
	IF register_patch('MigrateProposalsRankingToSepMeetingDecisions.sql', 'martintrajanovski', 'Migrate proposals to sep meeting decisions fields', '2021-03-23') THEN
        BEGIN
            -- migrate data into SEP_meeting_decisions
            FOR t_row in (
                SELECT * FROM proposals
                WHERE rank_order IS NOT NULL
            ) LOOP
                INSERT INTO "SEP_meeting_decisions" VALUES
				(
                    t_row.proposal_id,
                    t_row.comment_for_management,
                    t_row.comment_for_user,
                    t_row.rank_order,
                    t_row.final_status
                );
            END LOOP;

            ALTER TABLE proposals
            DROP COLUMN rank_order;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;