DO
$$
BEGIN
	IF register_patch('AddProposalStatusShortCodeAndIsDefaultFlag.sql', 'martintrajanovski', 'Change proposal statuses table', '2020-09-09') THEN
    BEGIN
        -- Should drop and re-create the view because of changing the name type to VARCHAR(100)
        DROP VIEW proposal_table_view;

        ALTER TABLE proposal_statuses ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
        ALTER TABLE proposal_statuses ADD COLUMN short_code VARCHAR(50);
        ALTER TABLE proposal_statuses ALTER COLUMN name TYPE VARCHAR(100);

        -- Should re-create the view because of changing the name type to VARCHAR(100)
        CREATE VIEW proposal_table_view as select 
        p.proposal_id as id, p.title,
        p.status_id as proposal_status_id,
        ps.name as proposal_status_name,
        ps.description as proposal_status_description,
        p.short_code, p.rank_order, p.final_status, p.notified,
        t.time_allocation, t.status as technical_review_status,
        i.name as instrument_name,
        c.call_short_code,
        s.code,
        c.call_id,
        i.instrument_id,
        (select round(avg(grade),1) from "SEP_Reviews" where proposal_id=p.proposal_id) as average,
        (select round(stddev_pop(grade),1) from "SEP_Reviews" where proposal_id=p.proposal_id) as deviation,
        p.submitted
        from proposals p 
        left join technical_review t on t.proposal_id = p.proposal_id
        left join instrument_has_proposals ihp on ihp.proposal_id = p.proposal_id
        left join proposal_statuses ps on ps.proposal_status_id = p.status_id
        left join instruments i on i.instrument_id = ihp.instrument_id
        left join call c on c.call_id = p.call_id
        left join "SEPs" s on s.sep_id = p.sep_id;

        UPDATE proposal_statuses SET short_code = name, is_default = true;
        ALTER TABLE proposal_statuses ALTER COLUMN short_code SET NOT NULL;

        INSERT INTO proposal_statuses (name, short_code, description, is_default) VALUES ('Feasibility and sample review', 'FEASIBILITY_AND_SAMPLE_REVIEW', 'Status that indicates that proposal feasibility and sample review can be done in the same time.', true);
        INSERT INTO proposal_statuses (name, short_code, description, is_default) VALUES ('Sample review', 'SAMPLE_REVIEW', 'Status that indicates that proposal sample review can be done.', true);
        INSERT INTO proposal_statuses (name, short_code, description, is_default) VALUES ('SEP Meeting', 'SEP_MEETING', 'Proposal is ready for SEP meeting ranking.', true);
        INSERT INTO proposal_statuses (name, short_code, description, is_default) VALUES ('Management decision', 'MANAGEMENT_DECISION', 'Proposal is ready for management decision.', true);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;