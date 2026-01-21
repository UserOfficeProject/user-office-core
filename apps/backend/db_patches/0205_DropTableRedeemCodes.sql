-- 0181_RemoveUserColumns.sql
DO
$$
BEGIN
    IF register_patch(
        '0205_DropTableRedeemCodes.sql',
        'Yoganandan Pandiyan',
        'Drop table redeem_codes',
        '2026-01-21'
    ) THEN
        BEGIN
           DROP TABLE IF EXISTS public.redeem_codes;
        END;
    END IF;
END;
$$
LANGUAGE plpgsql;
