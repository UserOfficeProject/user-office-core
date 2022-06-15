DO
$$
BEGIN
	IF register_patch('CleanupAfterProposalDelete.sql', 'jekabskarklins', 'Clean up data when deleting proposal', '2021-04-27') THEN

        /* Delete proposal questionary data  */
        CREATE OR REPLACE FUNCTION after_proposal_delete() RETURNS trigger AS $body$
        BEGIN
            DELETE FROM 
                questionaries
            WHERE
                questionary_id = old.questionary_id;
        RETURN old;
        END;
        $body$ LANGUAGE 'plpgsql';

        CREATE TRIGGER proposal_delete_trigger AFTER DELETE ON "proposals"
        FOR EACH ROW EXECUTE PROCEDURE after_proposal_delete();

        /* Delete sample questionary data  */
        CREATE OR REPLACE FUNCTION after_sample_delete() RETURNS trigger AS $body$
        BEGIN
            DELETE FROM 
                questionaries
            WHERE
                questionary_id = old.questionary_id;
        RETURN old;
        END;
        $body$ LANGUAGE 'plpgsql';

        CREATE TRIGGER sample_delete_trigger AFTER DELETE ON "samples"
        FOR EACH ROW EXECUTE PROCEDURE after_sample_delete();

        /* Delete shipment questionary data  */
        CREATE OR REPLACE FUNCTION after_shipment_delete() RETURNS trigger AS $body$
        BEGIN
            DELETE FROM 
                questionaries
            WHERE
                questionary_id = old.questionary_id;
        RETURN old;
        END;
        $body$ LANGUAGE 'plpgsql';

        CREATE TRIGGER shipment_delete_trigger AFTER DELETE ON "shipments"
        FOR EACH ROW EXECUTE PROCEDURE after_shipment_delete();

	END IF;
END;
$$
LANGUAGE plpgsql;