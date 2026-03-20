DO
$$
BEGIN
    IF register_patch('RemoveSurveyCommentFromCall.sql', 'jekabskarklins', 'Remove survey comment from call', '2026-02-11') THEN
        BEGIN
            ALTER TABLE "call" DROP COLUMN "survey_comment";
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;
