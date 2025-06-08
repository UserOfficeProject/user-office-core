DO
$$
BEGIN
    IF register_patch('0184_CorrectESFApprovedSpelling.sql', 'Yoganandan Pandiyan', 'Corrects the spelling of ESF APROVED to ESF APPROVED in the statuses table for experiment workflows.', '2025-04-30') THEN

      IF EXISTS (
        SELECT 1 FROM statuses WHERE name = 'ESF APROVED' OR short_code = 'ESF_APROVED' OR description ILIKE '%ESF aproved%'
      ) THEN
        UPDATE statuses
        SET name = 'ESF APPROVED',
            short_code = 'ESF_APPROVED',
            description = 'ESF approved'
        WHERE short_code = 'ESF_APROVED';
      END IF;

    END IF;
END;
$$
LANGUAGE plpgsql;