import { FormControl, Grid } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import React, { Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DateFilterInput, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

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

  const [searchParams, setSearchParams] = useSearchParams();

  const fromDate = searchParams.get('startsAt');
  const toDate = searchParams.get('endsAt');

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
                  setSearchParams((searchParams) => {
                    searchParams.delete('startsAt');
                    if (startsAt) {
                      searchParams.set(
                        'startsAt',
                        DateTime.fromJSDate(startsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      );
                    }

                    return searchParams;
                  });
                  const newValue: DateFilterInput = {
                    to: searchParams.get('to'),
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
                  setSearchParams((searchParams) => {
                    searchParams.delete('endsAt');
                    if (endsAt) {
                      searchParams.set(
                        'endsAt',
                        DateTime.fromJSDate(endsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      );
                    }

                    return searchParams;
                  });
                  const newValue: DateFilterInput = {
                    to: endsAt
                      ? DateTime.fromJSDate(endsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      : undefined,
                    from: searchParams.get('from'),
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
