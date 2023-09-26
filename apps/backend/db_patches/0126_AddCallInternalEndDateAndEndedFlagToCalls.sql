DO
$$
BEGIN
	IF register_patch('AddCallInternalEndDateAndEndedFlagToCalls.sql', 'Farai Mutambara', 'Add end call internal date and ended flag fields to call table', '2022-08-22') THEN
        BEGIN

            -- add end_call_internal column to call table
            ALTER TABLE "call" 
            ADD COLUMN IF NOT EXISTS end_call_internal TIMESTAMPTZ DEFAULT NOW();

             -- add call_ended_internal column to call table
            ALTER TABLE "call" ADD COLUMN call_ended_internal BOOLEAN DEFAULT FALSE;
            

            -- update end_call_internal date with end_call date column
            UPDATE "call"  SET end_call_internal = ( call.end_call ), call_ended_internal = true ;

             -- remove Default value from end_call_internal column making it nullable
            ALTER TABLE "call" ALTER COLUMN end_call_internal DROP DEFAULT;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;