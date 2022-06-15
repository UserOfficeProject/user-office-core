DO
$DO$
BEGIN
	IF register_patch('AlterProposals.sql', 'jekabskarklins', 'Implementing proposal shortcode', '2019-10-17') THEN
	BEGIN
		

		-- Usuing pseudorandom 6 digit integer

		CREATE SEQUENCE IF NOT EXISTS proposals_short_code_seq MAXVALUE 999999 MINVALUE 1 START 1;

		CREATE OR REPLACE FUNCTION generate_proposal_shortcode(id BIGINT) RETURNS TEXT AS $$
		DECLARE
			max_shortcode INT := 999999;
			coprime INT := 567122; -- this will give good random feel
			new_shortcode TEXT;
		BEGIN
			new_shortcode := CAST(coprime * id % max_shortcode as TEXT); 
			new_shortcode := LPAD(new_shortcode, 6, '0');
			RETURN new_shortcode;
		END;
		$$ LANGUAGE plpgsql VOLATILE;



		ALTER TABLE proposals
		ADD short_code VARCHAR(8) NOT NULL UNIQUE default generate_proposal_shortcode(nextval('proposals_short_code_seq'));

		CREATE UNIQUE INDEX proposals_short_code_idx ON proposals(short_code);



    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
