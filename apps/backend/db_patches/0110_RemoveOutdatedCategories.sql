DO
$$
BEGIN
    IF register_patch('RemoveOutdatedCategories.sql', 'Jekabs Karklins', 'Remove outdated categories', '2021-10-13') THEN

        DELETE FROM template_categories WHERE template_category_id=5; -- DELETE Experiment ESI
        DELETE FROM template_categories WHERE template_category_id=6; -- DELETE Sample ESI

    END IF;
END;
$$
LANGUAGE plpgsql;