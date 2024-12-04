import { FormControl, Grid } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import React, { Dispatch, useMemo } from 'react';

import { DateFilterInput, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';

export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy';

type DateFilterProps = {
  from?: string | null;
  to?: string | null;
  onChange?: Dispatch<DateFilterInput>;
};

const DateFilter = ({ onChange }: DateFilterProps) => {
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const inputDateFormat = format ?? DEFAULT_DATE_FORMAT;

  const initialParams = useMemo(
    () => ({
      startsAt: null,
      endsAt: null,
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    startsAt: string | null;
    endsAt: string | null;
  }>(initialParams);

  const fromDate = typedParams.startsAt;
  const toDate = typedParams.endsAt;

  return (
    <>
      <FormControl fullWidth>
        <Grid container spacing={2}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid item sm={3} xs={12}>
              <DatePicker
                format={inputDateFormat}
                label="From date"
                value={
                  fromDate
                    ? DateTime.fromFormat(fromDate, inputDateFormat)
                    : null
                }
                onChange={(startsAt) => {
                  if (startsAt) {
                    setTypedParams((prev) => ({
                      ...prev,
                      startsAt: DateTime.fromJSDate(
                        startsAt?.toJSDate()
                      ).toFormat(inputDateFormat),
                    }));
                  }

                  const newValue: DateFilterInput = {
                    to: typedParams.endsAt,
                    from: startsAt
                      ? DateTime.fromJSDate(startsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      : undefined,
                  };
                  onChange?.(newValue);
                }}
                sx={(theme) => ({ marginRight: theme.spacing(1) })}
                slotProps={{
                  textField: {
                    margin: 'none',
                    fullWidth: true,
                  },
                }}
                data-cy="from-date-picker"
              />
            </Grid>

            <Grid item sm={3} xs={12}>
              <DatePicker
                format={inputDateFormat}
                label="To date"
                value={
                  toDate ? DateTime.fromFormat(toDate, inputDateFormat) : null
                }
                onChange={(endsAt) => {
                  if (endsAt) {
                    setTypedParams((prev) => ({
                      ...prev,
                      endsAt: DateTime.fromJSDate(endsAt?.toJSDate()).toFormat(
                        inputDateFormat
                      ),
                    }));
                  }

                  const newValue: DateFilterInput = {
                    to: endsAt
                      ? DateTime.fromJSDate(endsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      : undefined,
                    from: typedParams.startsAt,
                  };
                  onChange?.(newValue);
                }}
                slotProps={{
                  textField: {
                    margin: 'none',
                    fullWidth: true,
                  },
                }}
                sx={(theme) => ({ marginRight: theme.spacing(1) })}
                data-cy="to-date-picker"
              />
            </Grid>
          </LocalizationProvider>
        </Grid>
      </FormControl>
    </>
  );
};

export default DateFilter;
