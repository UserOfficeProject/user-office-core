DO
$DO$
BEGIN
	IF register_patch('AlterGenerateProposalShortcode.sql', 'Russell McLean', 'Altering proposal shortcode', '2022-03-17') THEN
    BEGIN
      

      -- Usuing pseudorandom 6 digit integer

      CREATE OR REPLACE FUNCTION generate_proposal_shortcode(id BIGINT) RETURNS TEXT AS $$
      DECLARE
        max_shortcode INT := 999999;
        coprime INT := 567122; -- this will give good random feel
        new_shortcode TEXT;
      BEGIN
        new_shortcode := CAST(coprime * id % max_shortcode as TEXT); 
        new_shortcode := LPAD(new_shortcode, 6, '0');
        WHILE new_shortcode IN (SELECT proposal_id FROM proposals) LOOP
          -- generate new id
          new_shortcode := CAST(coprime * nextval('proposals_short_code_seq') % max_shortcode as TEXT); 
          new_shortcode := LPAD(new_shortcode, 6, '0');
        END LOOP;
        RETURN new_shortcode;
      END;
      $$ LANGUAGE plpgsql VOLATILE;



    END;
	END IF;
END;
$DO$
LANGUAGE plpgsql;
