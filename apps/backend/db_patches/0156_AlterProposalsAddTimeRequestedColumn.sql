DO
$$
BEGIN
	IF register_patch('AlterProposalsAddTimeRequestedColumn.sql', 'Bhaswati Dey', 'Adding Time Requested column in Proposals table', '2024-04-24') THEN
	BEGIN

        ALTER TABLE proposals add COLUMN time_requested integer;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
