DO
$$
BEGIN
    IF register_patch('AddShipmentLabelTemplate', 'User Office',
                      'Add editable shipment label layouts.', '2026-11-23') THEN
        ALTER TABLE templates ADD COLUMN shipment_label_template text;
    END IF;
END;
$$
LANGUAGE plpgsql;
