CREATE OR REPLACE FUNCTION consistent_shuffle(alphabet TEXT, salt TEXT) RETURNS TEXT AS $$
DECLARE
    SALT_LENGTH INT := length(salt);
    integer INT = 0;
    temp TEXT = '';
    j INT = 0;
    v INT := 0;
    p INT := 0;
    i INT := length(alphabet) - 1;
    output TEXT := alphabet;
BEGIN
    IF salt IS NULL OR length(LTRIM(RTRIM(salt))) = 0 THEN
        RETURN alphabet;
    END IF;
    WHILE i > 0 LOOP
        v := v % SALT_LENGTH;
        integer := ASCII(substr(salt, v + 1, 1));
        p := p + integer;
        j := (integer + v + p) % i;

        temp := substr(output, j + 1, 1);
        output := substr(output, 1, j) || substr(output, i + 1, 1) || substr(output, j + 2);
        output := substr(output, 1, i) || temp || substr(output, i + 2);

        i := i - 1;
        v := v + 1;
    END LOOP;
    RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE OR REPLACE FUNCTION generate_uid(id INT, clean_alphabet TEXT, curse_chars TEXT, min_length INT) RETURNS TEXT AS $$
DECLARE
	salt TEXT := 'SRK0SUBCifwa6LsfH8UeYQLPW6DwLoEs';
    curse TEXT := curse_chars || UPPER(curse_chars);
    alphabet TEXT := regexp_replace(clean_alphabet, '[' || curse  || ']', '', 'gi');
    shuffle_alphabet TEXT := consistent_shuffle(alphabet, salt);
    char_length INT := length(alphabet);
    output TEXT := '';
BEGIN
    WHILE id != 0 LOOP
        output := output || substr(shuffle_alphabet, (id % char_length) + 1, 1);
        id := trunc(id / char_length);
    END LOOP;
    curse := consistent_shuffle(curse, output || salt);
    output := RPAD(output, min_length, curse);
    RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;



   
CREATE OR REPLACE FUNCTION generate_airline_code(id INT) RETURNS TEXT AS $$
DECLARE
	base TEXT := generate_uid(id, '12345678', '90', 6); -- this is defines guaranteed total number of ids 8ˆ6 = 262144
	lettersSeed INT := CAST(substr(base, 0, 5) as INTEGER); -- substr from basestring thats used for letters in airline code as seed
	numbersSeed INT := CAST(substr(base, 5, 2) as INTEGER); -- substr from basestring thats used for numbers in airline code as seed
	letters TEXT := '';
	numbers TEXT := '';
	output TEXT := '';
	
BEGIN
	
	letters := generate_uid(lettersSeed, 'BCDEFGHJKLMNPRSTUVWXYZ', 'A', 3); -- the length of (alphabet ^ min_length) must be greater than letterseed maxvalue otherwise there will be early collisions
	numbers := generate_uid(numbersSeed, '3456789', '2', 3); -- the length of (alphabet ^ min_length) must be greater than than numbersSeed maxvalue otherwise there will be early collisions
    output := letters || numbers;
    RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE SEQUENCE proposals_short_code_seq START 7; -- first 7 sequence codes will generate the same TEXT part 'HUT' for all proposals

ALTER TABLE proposals
ADD short_code VARCHAR(50) NOT NULL UNIQUE default generate_airline_code(CAST (nextval('proposals_short_code_seq') AS INTEGER));

CREATE UNIQUE INDEX proposals_short_code_idx ON proposals(short_code);




