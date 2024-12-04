DO
$$
BEGIN
    IF register_patch('0166_ExcludeExpiredProposalsFromReviewProposalView.sql', 'Thomas Cottee Meldrum', 'Update review column in the view', '2024-12-03') THEN

CREATE OR REPLACE VIEW review_data AS 
	 SELECT proposal.proposal_pk,
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
		proposal.public_comment as comment
		from (
        Select 
                fp.proposal_pk,
                p.proposal_id,
                p.title,
                i.name as instrument_name,
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
            from fap_proposals as fp
            join faps as f on f.fap_id = fp.fap_id
            join call c on c.call_id = fp.call_id
            join proposals p on p.proposal_pk = fp.proposal_pk
            join technical_review tr on tr.proposal_pk = p.proposal_pk and tr.instrument_id = fp.instrument_id
            left join fap_meeting_decisions as fmd on fmd.proposal_pk = p.proposal_pk
            join call_has_instruments as chi on chi.instrument_id = fp.instrument_id and chi.call_id = c.call_id
            join instruments as i on i.instrument_id = chi.instrument_id
			where p.status_id <> 9 and p.status_id <> 1 /* EXPIRED  OR DRAFT*/
			) as proposal
            left join (
                Select fr.proposal_pk, AVG(fr.grade) from 
                fap_proposals as fp
                join fap_reviews as fr on fr.proposal_pk = fp.proposal_pk
                group by fr.proposal_pk
            ) as grade on grade.proposal_pk = proposal.proposal_pk;
    END IF;
END;
$$
LANGUAGE plpgsql;
