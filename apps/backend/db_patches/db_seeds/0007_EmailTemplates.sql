DO
$DO$
BEGIN

    INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'template-name-1', 'template-description-1', 'template-subject-1', 'template-body-1');

    INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'template-name-2', 'template-description-2', 'template-subject-2', 'template-body-2');            

END;
$DO$
LANGUAGE plpgsql;
