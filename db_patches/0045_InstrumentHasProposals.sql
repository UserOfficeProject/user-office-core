DO
$$
BEGIN
	IF register_patch('InstrumentHasProposals.sql', 'martintrajanovski', 'instrument_has_proposals table creation', '2020-06-23') THEN
	BEGIN

    CREATE TABLE IF NOT EXISTS "instrument_has_proposals" (
      instrument_id int REFERENCES instruments (instrument_id) ON UPDATE CASCADE,
      proposal_id int REFERENCES proposals (proposal_id) ON UPDATE CASCADE,
      CONSTRAINT instrument_has_proposals_pkey PRIMARY KEY (instrument_id, proposal_id)  -- explicit pk
    );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;