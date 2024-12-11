DO
$$
BEGIN
	IF register_patch('AddViewForGenericTemplates.sql', 'ellenwright', 'Add new view for generic templates', '2024-11-13') THEN
	BEGIN

    CREATE VIEW generic_templates_view  as select 
    g.generic_template_id as generic_template_id, g.title, g.creator_id, g.proposal_pk, g.questionary_id, g.question_id, g.created_at,
    fr.user_id as fap_reviewer,
    fc.user_id as fap_chair,
    fs.user_id as fap_secretary,
    i.manager_user_id as instrument_manager,
    ihs.user_id as scientist_on_proposal, 
    vu.user_id as visitor

    from generic_templates g
    left join visits v on v.proposal_pk = g.proposal_pk
    left join visits_has_users vu on vu.visit_id = v.visit_id 
    left join fap_reviews fr on fr.proposal_pk = g.proposal_pk
    left join fap_chairs fc on fc.fap_id = fr.fap_id
    left join fap_secretaries fs on fs.fap_id = fr.fap_id
    left join instrument_has_proposals ihp on ihp.proposal_pk = g.proposal_pk
    left join instrument_has_scientists ihs on ihs.instrument_id = ihp.instrument_id
    left join instruments i on i.instrument_id = ihp.instrument_id;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;