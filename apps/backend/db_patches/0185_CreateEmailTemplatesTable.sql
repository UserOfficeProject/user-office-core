DO
$$
DECLARE 
      email_template_id_var int;
      connection_loop_var record;
      array_size_var int;
      array_loop_var int;
      template_name varchar(200);
BEGIN
	IF register_patch('CreateEmailTemplatesTable.sql', 'Gergely Nyiri', 'Create emails table', '2025-07-15') THEN

            CREATE TABLE IF NOT EXISTS email_templates (
                  email_template_id serial PRIMARY KEY,
                  created_by INT NOT NULL REFERENCES users(user_id),
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  name varchar(100) NOT NULL UNIQUE,
                  description varchar(255) NOT NULL, 
                  subject varchar(160) NOT NULL, 
                  body text
            ); 

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'clf-proposal-submitted-pi', 'CLF PI Co-I Submission Email', 'Proposal submitted', 'Proposal submitted');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'isis-proposal-submitted-pi', 'ISIS PI Co-I Submission Email', 'Proposal submitted', 'Proposal submitted');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'isis-rapid-proposal-submitted-pi', 'ISIS Rapid PI Co-I Submission Email', 'Proposal submitted', 'Proposal submitted');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'isis-rapid-proposal-submitted-uo', 'ISIS Rapid User Office Submission Email', 'Proposal submitted', 'Proposal submitted');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-submitted-pi', 'ISIS Xpress PI Co-I Submission Email', 'Proposal submitted', 'Proposal submitted');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-submitted-sc', 'ISIS Xpress Scientist Submission Email', 'Proposal submitted', 'Proposal submitted');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-under-review', 'ISIS Xpress PI Co-I Under Review Email', 'Proposal under review', 'Proposal under review');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-approved', 'ISIS Xpress PI Co-I Approval Email', 'Proposal approved', 'Proposal approved');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-sra', 'ISIS Xpress SRA Request Email', 'Proposal SRA request', 'Proposal SRA request');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-unsuccessful', 'ISIS Xpress PI Co-I Reject Email', 'Proposal unsuccessful', 'Proposal unsuccessful');

            INSERT INTO email_templates (created_by, name, description, subject, body)
            VALUES
                  (0, 'xpress-proposal-finished', 'ISIS Xpress PI Co-I Finish Email', 'Proposal finished', 'Proposal finished');

            FOR connection_loop_var IN
                  SELECT * FROM workflow_connection_has_actions
            LOOP
                  IF connection_loop_var.config IS NOT NULL THEN
                        SELECT jsonb_array_length(connection_loop_var.config->'recipientsWithEmailTemplate') INTO array_size_var;

                        FOR array_loop_var IN 0..array_size_var-1 LOOP
                              SELECT connection_loop_var.config->'recipientsWithEmailTemplate'->array_loop_var->'emailTemplate'->>'id' INTO template_name;

                              IF template_name IS NOT NULL THEN
                                    -- RAISE NOTICE 'Processing connection % % with template % to %', array_loop_var, connection_loop_var.connection_id, template_name,  update_config;

                                    SELECT email_templates.email_template_id INTO email_template_id_var FROM email_templates WHERE name = template_name;
                                    
                                    IF email_template_id_var IS NOT NULL THEN
                                          UPDATE workflow_connection_has_actions 
                                          SET config = jsonb_set(config::jsonb, ('{recipientsWithEmailTemplate, ' || array_loop_var || ', emailTemplate, id}')::text[], to_jsonb(email_template_id_var), false)
                                          WHERE connection_id = connection_loop_var.connection_id;
                                    -- ELSE
                                    --       RAISE WARNING 'No email template found for name %', template_name;
                                    END IF;
                              -- ELSE
                              --       RAISE WARNING 'No email template found for connection %', template_name;
                              END IF;
                        END LOOP;
                  END IF;
            END LOOP;
      END IF;
END;
$$
LANGUAGE plpgsql;