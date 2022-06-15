DO
$DO$
DECLARE 
	proposal_esi_template_id INTEGER;
	proposal_esi_template_topic_id INTEGER;
	sample_esi_template_id INTEGER;
	sample_esi_template_topic_id INTEGER;
BEGIN

	INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('default esi template', 'default esi template', false, 'PROPOSAL_ESI') 
	RETURNING template_id INTO proposal_esi_template_id;

	INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('New ESI', true, 0, proposal_esi_template_id)
	RETURNING topic_id INTO proposal_esi_template_topic_id;

	INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('proposal_esi_basis', proposal_esi_template_id, proposal_esi_template_topic_id, 0, '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}', 'AND');

	INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('default sample esi template', 'default sample esi template', false, 'SAMPLE_ESI')
	RETURNING template_id INTO sample_esi_template_id;

	INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('New Sample ESI', true, 0, sample_esi_template_id)
	RETURNING topic_id INTO sample_esi_template_topic_id;

	INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('sample_esi_basis', sample_esi_template_id, sample_esi_template_topic_id, 0, '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}', 'AND');

	UPDATE public.call SET esi_template_id=proposal_esi_template_id;

END;
$DO$
LANGUAGE plpgsql;

