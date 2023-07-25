DO
$DO$
BEGIN

  INSERT INTO proposal_user( proposal_pk, user_id )
  VALUES ( 1, 5 );

  INSERT INTO redeem_codes( code, placeholder_user_id, created_by ) 
  VALUES ( '123abc', 5, 1);

END;
$DO$
LANGUAGE plpgsql;