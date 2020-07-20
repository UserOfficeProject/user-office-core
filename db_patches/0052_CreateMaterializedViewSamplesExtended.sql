

DO
$$
BEGIN
	IF register_patch('CreateMaterializedViewSamplesExtended.sql', 'jekabskarklins', 'Create materialized view to query samples faster', '2020-07-16') THEN
    BEGIN
        CREATE MATERIALIZED VIEW samples_extended_view AS
        SELECT samples.*, proposals.proposal_id, proposals.call_id from answer_has_questionaries
        LEFT JOIN answers on answer_has_questionaries.answer_id = answers.answer_id
        LEFT JOIN proposals on answers.questionary_id = proposals.questionary_id
        LEFT JOIN samples on samples.questionary_id = answer_has_questionaries.questionary_id

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;