DO
$$
DECLARE
    shipmentCategoryId int;
BEGIN
	IF register_patch('RenameVisitationToVisit.sql', 'jekabskarklins', 'Improve naming', '2021-06-07') THEN


      ALTER TABLE visitations RENAME TO visits;

      ALTER TABLE visits 
      RENAME visitation_id TO visit_id;

      UPDATE template_categories SET name='Visit' WHERE name='Visitation';

      UPDATE question_datatypes SET question_datatype_id='VISIT_BASIS' WHERE question_datatype_id='VISITATION_BASIS';

      ALTER TABLE templates_has_questions
      DROP CONSTRAINT IF EXISTS templates_has_questions_question_id_fkey,
      add CONSTRAINT templates_has_questions_question_id_fkey
         FOREIGN KEY (question_id)
         REFERENCES questions(question_id)
         ON UPDATE cascade;
         
      UPDATE questions 
      SET 
        question_id='visit_basis',
        data_type='VISIT_BASIS',
        question='Visit basic information',
        natural_key='visitat_basis'
      WHERE 
        question_id='visitation_basis';


       ALTER TABLE visitations_has_users RENAME TO visits_has_users;

      ALTER TABLE visits_has_users 
      RENAME visitation_id TO visit_id;


	END IF;
END;
$$
LANGUAGE plpgsql;