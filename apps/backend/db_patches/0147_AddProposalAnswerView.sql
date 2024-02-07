DO
$$
BEGIN
    IF register_patch('AddProposalAnswerView.sql', 'Alex Lay', 'Add a view to simplify proposal answer access in SQL queries', '2024-02-02') THEN
    BEGIN

        CREATE VIEW proposal_answers AS
             SELECT prop.proposal_pk,
                    prop.proposal_id,
                    gt.generic_template_id,
                    template_q.natural_key as generic_template_natural_key,
                    gt.title as generic_template_title,
                    a.answer_id,
                    q.natural_key as question_natural_key,
                    a.answer #> '{value}' AS full_value,
                    COALESCE(
                        a.answer #>> '{value,0}',
                        a.answer #>> '{value,value}',
                        a.answer #>> '{value}'
                    ) AS first_value
               FROM proposals prop
               JOIN generic_templates gt
                 ON prop.proposal_pk = gt.proposal_pk
               JOIN questions template_q
                 ON gt.question_id = template_q.question_id
               JOIN answers a
                 ON gt.questionary_id = a.questionary_id
               JOIN questions q
                 ON a.question_id = q.question_id
                 
              UNION

             SELECT prop.proposal_pk,
                    prop.proposal_id,
                    null,
                    null,
                    null,
                    a.answer_id,
                    q.natural_key,
                    a.answer #> '{value}' AS full_value,
                    COALESCE(
                        a.answer #>> '{value,0}',
                        a.answer #>> '{value,value}',
                        a.answer #>> '{value}'
                    ) AS first_value
               FROM proposals prop
               JOIN answers a
                 ON prop.questionary_id = a.questionary_id
               JOIN questions q
                 ON a.question_id = q.question_id;

    END;
    END IF;
END;
$$
LANGUAGE plpgsql;
