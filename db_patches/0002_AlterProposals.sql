
CREATE OR REPLACE FUNCTION random_string(seed int) -- this must not be random
RETURNS text AS $$
SELECT array_to_string(
  ARRAY(
      SELECT substring(
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
        trunc(random()*34)::int+1,
        1
      )
      FROM generate_series(1,10) AS gs(x)
  )
  , ''
)
$$ LANGUAGE SQL
RETURNS NULL ON NULL INPUT
VOLATILE LEAKPROOF;

DROP SEQUENCE IF EXISTS proposals_short_code_seq;
CREATE SEQUENCE proposals_short_code_seq;

ALTER TABLE proposals
ADD short_code VARCHAR(50) NOT NULL UNIQUE default random_string(proposals_short_code_seq);

CREATE UNIQUE INDEX proposals_short_code_idx ON proposals(short_code);
