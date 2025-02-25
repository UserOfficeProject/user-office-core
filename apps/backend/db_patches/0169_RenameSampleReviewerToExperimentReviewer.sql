DO
$$
BEGIN
	IF register_patch('0169_RenameSampleReviewerToExperimentReviewer.sql', 'Yoganandan Pandiyan', 'Rename the Roles Sample Safety Reviewer to Experiment Safety Reviewer', '2024-01-31') THEN
    BEGIN
      UPDATE roles SET title = 'Experiment safety reviewer', short_code = 'experiment_safety_reviewer' WHERE short_code = 'sample_safety_reviewer';

      UPDATE settings SET settings_id = 'EXPERIMENT_SAFETY_REVIEW_EMAIL', description = 'Email address for the experiment safety review team.' WHERE settings_id = 'SAMPLE_SAFETY_EMAIL';

      UPDATE features SET feature_id = 'EXPERIMENT_SAFETY_REVIEW', description = 'Experiment safety review functionality' WHERE feature_id = 'SAMPLE_SAFETY';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;