DO
$$
BEGIN
    IF register_patch('AdjustingTemplateCategories', 'Jekabs Karklins', 'Adjust template categories to ESI requirements', '2021-09-17') THEN

        UPDATE template_categories set name='Experiment ESI' WHERE name='Risk assessment';
        INSERT into template_categories(name) values('Sample ESI');

    END IF;
END;
$$
LANGUAGE plpgsql;