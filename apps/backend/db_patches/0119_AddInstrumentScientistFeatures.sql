DO
$$
BEGIN
    IF register_patch('AddInstrumentScientistFeatures.sql', 'Russell McLean', 'Add Instrument Scientist Features', '2022-03-25') THEN

    INSERT INTO features(feature_id, description) VALUES ('INSTRUMENT_MANAGEMENT', 'Instrument management functionality');

    INSERT INTO features(feature_id, description) VALUES ('TECHNICAL_REVIEW', 'Technical review functionality');

    END IF;
END;
$$
LANGUAGE plpgsql;