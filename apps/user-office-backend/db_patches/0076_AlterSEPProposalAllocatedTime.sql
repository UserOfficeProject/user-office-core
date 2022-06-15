DO
$$
BEGIN
    IF register_patch('AlterSEPProposalAllocatedTime.sql', 'Peter Asztalos', 'Alter SEP_Proposals, add SEP allocated time', '2021-01-15') THEN

        ALTER TABLE "SEP_Proposals" ADD sep_time_allocation INT DEFAULT NULL;

    END IF;
END;
$$
LANGUAGE plpgsql;