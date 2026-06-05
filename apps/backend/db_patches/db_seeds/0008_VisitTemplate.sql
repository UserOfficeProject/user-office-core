DO
$DO$
DECLARE
  visit_registration_template_id_var int;
  visit_registration_template_topic_id_var int;
BEGIN
  INSERT INTO templates(name, description, is_archived, group_id)
  VALUES (
    'default visit registration template',
    'default visit registration template',
    false,
    'VISIT_REGISTRATION'
  )
  RETURNING template_id INTO visit_registration_template_id_var;

  INSERT INTO topics(topic_title, is_enabled, sort_order, template_id)
  VALUES (
    'Visit registration',
    true,
    0,
    visit_registration_template_id_var
  )
  RETURNING topic_id INTO visit_registration_template_topic_id_var;

  INSERT INTO templates_has_questions(
    question_id,
    template_id,
    topic_id,
    sort_order,
    config,
    dependencies_operator
  )
  VALUES (
    'visit_basis',
    visit_registration_template_id_var,
    visit_registration_template_topic_id_var,
    0,
    '{"titlePlaceholder":"Title","required":false,"small_label":"","tooltip":"","readPermissions":[]}',
    'AND'
  );

  INSERT INTO active_templates(group_id, template_id)
  VALUES ('VISIT_REGISTRATION', visit_registration_template_id_var)
  ON CONFLICT (group_id)
  DO UPDATE SET template_id = EXCLUDED.template_id;
END;
$DO$
LANGUAGE plpgsql;
