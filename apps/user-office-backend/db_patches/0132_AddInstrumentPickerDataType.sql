DO
$$
BEGIN
	IF register_patch('AddInstrumentPickerDataType.sql', 'Yoganandan Pandiyan', 'Adding Instrument Picker type', '2023-05-21') THEN
	BEGIN

    INSERT INTO question_datatypes VALUES('INSTRUMENT_PICKER');

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
