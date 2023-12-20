DO
$$
BEGIN
	IF register_patch('MultiInstrumentPerProposal.sql', 'martintrajanovski', 'Mutliple instrument per proposal', '2023-12-18') THEN
	BEGIN

      -- ALTER TABLE technical_review 
			-- ADD COLUMN instrument_id INT REFERENCES instruments (instrument_id) ON UPDATE CASCADE ON DELETE CASCADE;

			-- ALTER TABLE technical_review DROP CONSTRAINT technical_review_proposal_id_key;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;