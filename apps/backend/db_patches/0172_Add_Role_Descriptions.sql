DO
$$
BEGIN
  IF register_patch('0172_Add_Role_Descriptions', 'TCMeldrum', 'Add role descriptions', '2025-03-18') THEN
    BEGIN

        ALTER table roles ADD COLUMN description text;

        UPDATE roles set description = 'Submit and view your proposals' where short_code = 'user';
        UPDATE roles set description = 'Manage the system' where short_code = 'user_officer';
        UPDATE roles set description = 'View and manage your FAP panel and submit FAP reviews' where short_code = 'fap_chair';
        UPDATE roles set description = 'View and manage your FAP panel and submit FAP reviews' where short_code = 'fap_secretary';
        UPDATE roles set description = 'Submit and view your FAP reviews' where short_code = 'fap_reviewer';
        UPDATE roles set description = 'Edit and view your technical reviews and view proposals for your instruments' where short_code = 'instrument_scientist';
        UPDATE roles set description = 'Edit and submit Experiment Safety reviews' where short_code = 'experiment_safety_reviewer';
        UPDATE roles set description = 'Edit and submit your internal reviews' where short_code = 'internal_reviewer';
     
    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
