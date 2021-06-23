DO
$$
BEGIN
	IF register_patch('RenameProposalIdToProposalPk.sql', 'jekabskarklins', 'Rename proposal id to proposal_pk', '2021-06-14') THEN
    ALTER TABLE "SEP_Assignments" RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE "SEP_Proposals" RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE "SEP_Reviews" RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE "SEP_meeting_decisions" RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE instrument_has_proposals RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE proposal_events RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE proposals RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE technical_review RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE proposal_user RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE samples RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE shipments RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE visits RENAME COLUMN proposal_id TO proposal_pk;
    ALTER TABLE proposal_table_view RENAME COLUMN id TO proposal_pk;


    ALTER TABLE proposals RENAME COLUMN short_code TO proposal_id;
    ALTER TABLE proposal_table_view RENAME COLUMN short_code TO proposal_id;
	END IF;
END;
$$
LANGUAGE plpgsql;
