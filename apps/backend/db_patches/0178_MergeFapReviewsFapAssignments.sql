DO
$$
BEGIN
  IF register_patch('0178_MergeFapReviewsFapAssignments.sql', 'TCMeldrum', 'Merge Fap Reviews and Fap Assignments table', '2025-04-22') THEN
    BEGIN

      AlTER TABLE fap_reviews
      ADD COLUMN date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ADD COLUMN reassigned boolean DEFAULT false,
      ADD COLUMN date_reassigned TIMESTAMPTZ DEFAULT null,
      ADD COLUMN email_sent boolean DEFAULT false,
      ADD COLUMN rank INTEGER;


      UPDATE fap_reviews as fr
      SET
        date_assigned = fa.date_assigned,
        reassigned = fa.reassigned,
        date_reassigned = fa.date_reassigned,
        email_sent = fa.email_sent,
        rank = fa.rank
      FROM fap_assignments fa
      WHERE fa.fap_proposal_id = fr.fap_proposal_id
        AND fa.fap_member_user_id = fr.user_id;

      DROP TABLE fap_assignments;

    END;
  END IF;
END;
$$
LANGUAGE plpgsql;
