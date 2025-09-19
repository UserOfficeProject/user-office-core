DO
$$
BEGIN
    IF register_patch('Update_email_search_description.sql', 'jekabskarklins', 'Updates email search description to make it more clear.', '2025-09-09') THEN
      BEGIN
        UPDATE features
        SET description = 'By setting this feature ON, users can be searched *only* by their exact email addresses.'
        WHERE feature_id = 'EMAIL_SEARCH';
      END;
    END IF;
END;
$$
LANGUAGE plpgsql;
