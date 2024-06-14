DO
$$
BEGIN
	IF register_patch('0155_HandleMultipleFapPerProposal', 'martintrajanovski', 'Handle mutliple FAPs per proposal', '2024-04-22') THEN
	BEGIN

			ALTER TABLE fap_meeting_decisions ADD COLUMN instrument_id INT REFERENCES instruments(instrument_id) ON DELETE CASCADE;
			ALTER TABLE fap_meeting_decisions ADD COLUMN fap_id INT REFERENCES faps(fap_id) ON DELETE CASCADE;
			UPDATE fap_meeting_decisions
			SET instrument_id = (
				SELECT instrument_id
				FROM instrument_has_proposals
				WHERE fap_meeting_decisions.proposal_pk = instrument_has_proposals.proposal_pk
				ORDER BY instrument_has_proposals_id ASC
				LIMIT 1
			);
			UPDATE fap_meeting_decisions
			SET fap_id = (
				SELECT fap_id
				FROM fap_proposals
				WHERE fap_meeting_decisions.proposal_pk = fap_proposals.proposal_pk
				ORDER BY fap_proposal_id ASC
				LIMIT 1
			);
			ALTER TABLE fap_meeting_decisions DROP CONSTRAINT fap_meeting_decisions_pkey;
			ALTER TABLE fap_meeting_decisions ADD PRIMARY KEY (proposal_pk, instrument_id);

			ALTER TABLE fap_reviews DROP CONSTRAINT fap_reviews_pkey;
			ALTER TABLE fap_reviews ADD PRIMARY KEY (proposal_pk, user_id, fap_id);

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;