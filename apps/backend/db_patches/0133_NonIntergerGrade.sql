DO
$$
BEGIN
	IF register_patch('NonIntergerGradeGrade', 'Thomas Cottee Meldrum', 'Add non interger grade', '2023-07-05') THEN
		BEGIN
		  INSERT INTO 
			settings(settings_id, description)
		  VALUES
			('GRADE_PRECISION', 'What the increment of the grade number should be')
		  ON
		    CONFLICT (settings_id)
		  DO
		    UPDATE SET description = EXCLUDED.description;


			DROP VIEW proposal_table_view;

			ALTER TABLE "SEP_Reviews" ALTER COLUMN grade TYPE FLOAT USING grade::float;

			CREATE VIEW proposal_table_view
				AS
				SELECT  p.proposal_pk AS proposal_pk,
						p.title,
						p.proposer_id AS principal_investigator,
						p.status_id AS proposal_status_id,
						ps.name AS proposal_status_name,
						ps.description AS proposal_status_description,
						p.proposal_id,
						smd.rank_order as rank_order,
						p.final_status,
						p.notified,
						p.questionary_id,
						t.time_allocation as technical_time_allocation,
						p.management_time_allocation,
						t.technical_review_assignee_id,
						u.firstname as technical_review_assignee_firstname,
						u.lastname as technical_review_assignee_lastname,
						t.status AS technical_review_status,
						t.submitted as technical_review_submitted,
						i.name AS instrument_name,
						c.call_short_code,
						s.code AS sep_code,
						s.sep_id AS sep_id,
						c.allocation_time_unit,
						c.call_id,
						i.instrument_id,
						( SELECT round(avg("SEP_Reviews".grade)::numeric, 2) AS round
								FROM "SEP_Reviews"
								WHERE "SEP_Reviews".proposal_pk = p.proposal_pk) AS average,
						( SELECT round(stddev_pop("SEP_Reviews".grade)::numeric, 2) AS round
								FROM "SEP_Reviews"
								WHERE "SEP_Reviews".proposal_pk = p.proposal_pk) AS deviation,
						p.submitted
				FROM proposals p
				LEFT JOIN technical_review t ON t.proposal_pk = p.proposal_pk
				LEFT JOIN users u ON u.user_id = t.technical_review_assignee_id
				LEFT JOIN instrument_has_proposals ihp ON ihp.proposal_pk = p.proposal_pk
				LEFT JOIN proposal_statuses ps ON ps.proposal_status_id = p.status_id
				LEFT JOIN instruments i ON i.instrument_id = ihp.instrument_id
				LEFT JOIN call c ON c.call_id = p.call_id
				LEFT JOIN "SEP_Proposals" sp ON sp.proposal_pk = p.proposal_pk
				LEFT JOIN "SEPs" s ON s.sep_id = sp.sep_id
				LEFT JOIN "SEP_meeting_decisions" smd ON smd.proposal_pk = p.proposal_pk;

		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
