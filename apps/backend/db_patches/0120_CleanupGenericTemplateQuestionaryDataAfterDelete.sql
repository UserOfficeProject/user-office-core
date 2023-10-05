DO
$$
BEGIN
	IF register_patch('0120_CleanupGenericTemplateQuestionaryDataAfterDelete.sql', 'Thomas Cottee Meldrum', 'Clean up data when deleting gernic template', '2022-04-12') THEN

        /* Delete generic template questionary data  */
        CREATE OR REPLACE FUNCTION after_generic_template_delete() RETURNS trigger AS $body$
        BEGIN
            DELETE FROM 
                questionaries
            WHERE
                questionary_id = old.questionary_id;
        RETURN old;
        END;
        $body$ LANGUAGE 'plpgsql';

        CREATE TRIGGER generic_templates_delete_trigger AFTER DELETE ON "generic_templates"
        FOR EACH ROW EXECUTE PROCEDURE after_generic_template_delete();

	END IF;
END;
$$
LANGUAGE plpgsql;