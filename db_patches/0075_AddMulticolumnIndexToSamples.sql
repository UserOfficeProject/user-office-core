DO
$$
BEGIN
    IF register_patch('AddMulticolumnIndexToSamples.sql', 'Peter Asztalos', 'Add Multicolumn Index To Samples', '2021-01-11') THEN

        CREATE INDEX samples_proposal_id_question_id_mm_idx ON "samples" ("proposal_id", "question_id");

    END IF;
END;
$$
LANGUAGE plpgsql;