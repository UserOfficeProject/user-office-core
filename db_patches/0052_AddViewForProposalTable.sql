


DO
$$
BEGIN
	IF register_patch('AddViewForProposalTable.sql', 'fredrikbolmsten', 'Add new view for proposal table', '2020-07-29') THEN
	BEGIN

    CREATE VIEW proposal_table_view  as select 
    p.proposal_id as id, p.title, p.status as proposal_status, p.short_code, p.rank_order, p.final_status, p.notified, 
    t.time_allocation, t.status,
    i.name as instrument_name,
    c.call_short_code,
    s.code,
    c.call_id,
    i.instrument_id,
    (select round(avg(grade),1) from "SEP_Reviews" where proposal_id=p.proposal_id) as average,
    (select round(stddev_pop(grade),1) from "SEP_Reviews" where proposal_id=p.proposal_id) as deviation
    from proposals p 
    left join technical_review t on t.proposal_id = p.proposal_id
    left join instrument_has_proposals ihp on ihp.proposal_id = p.proposal_id 
    left join instruments i on i.instrument_id = ihp.instrument_id
    left join call c on c.call_id = p.call_id
    left join "SEPs" s on s.sep_id = p.sep_id;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;