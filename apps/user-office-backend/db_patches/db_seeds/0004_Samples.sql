DO
$DO$
BEGIN

  INSERT INTO public.templates(
	name, description, is_archived, group_id)
	VALUES ('default sample template', 'default sample template', false, 'SAMPLE');
	
INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('New sample', true, 0, 4);
	
INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('sample_basis', 4, 4, 0, '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":""}', 'AND');
	
INSERT INTO public.questions(
	question_id, data_type, question, default_config, created_at, updated_at, natural_key, category_id)
	VALUES ('sample_declaration_question', 'SAMPLE_DECLARATION', 'Add samples', '{"addEntryButtonLabel":"Add","minEntries":null,"maxEntries":null,"templateId":4,"esiTemplateId":3,"templateCategory":"SAMPLE_DECLARATION","required":false,"small_label":""}',
			'2021-07-20 13:53:29.246687+00', '2021-07-20 13:53:29.246687+00', 'sample_declaration_question', 1);
	
INSERT INTO public.topics(
	 topic_title, is_enabled, sort_order, template_id)
	VALUES ('Topic title', true, 1, 1);
	
INSERT INTO public.templates_has_questions(
	question_id, template_id, topic_id, sort_order, config, dependencies_operator)
	VALUES ('sample_declaration_question', 1, 5, 0, '{"addEntryButtonLabel":"Add","templateCategory":"SAMPLE_DECLARATION","templateId":4,"esiTemplateId":3,"small_label":"","required":false,"minEntries":null,"maxEntries":null}', 'AND');

INSERT INTO public.questionaries(
	template_id, created_at, creator_id)
	VALUES ( 4, '2021-07-20 13:59:08.597908+00', 2);
	
INSERT INTO public.samples(
	title, creator_id, questionary_id, safety_status, created_at, safety_comment, proposal_pk, question_id, shipment_id)
	VALUES ('My sample title', 2, 2, 0, '2021-07-20 13:59:08.602853+00', '', 1, 'sample_declaration_question', null);
	
INSERT INTO public.topic_completenesses(
	questionary_id, topic_id, is_complete)
	VALUES (2, 4, true);
	
INSERT INTO public.topic_completenesses(
	questionary_id, topic_id, is_complete)
	VALUES (1, 1, true);
	
INSERT INTO public.topic_completenesses(
	questionary_id, topic_id, is_complete)
	VALUES (1, 5, true);



END;
$DO$
LANGUAGE plpgsql;

