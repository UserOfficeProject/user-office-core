DO
$$
BEGIN
    IF register_patch('AddMultiPartSelectionComponent.sql', 'Keiran Price', 'Adding new question type', '2022-06-02') THEN
    BEGIN
        INSERT INTO question_datatypes VALUES('MULTI_PART_SELECTION');
    END;
    END IF;
END;
$$
LANGUAGE plpgsql;