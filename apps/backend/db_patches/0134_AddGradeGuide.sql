DO
$$
BEGIN
	IF register_patch('AddGradeGuide.sql', 'rasmiakulan', 'Add_grade_guide_specific_to_facility', '2023-08-03') THEN
	BEGIN

        ALTER TABLE "SEPs" ADD COLUMN grade_guide text;
		ALTER TABLE "SEPs" ADD COLUMN custom_grade_guide boolean;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;