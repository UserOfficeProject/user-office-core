import { FormControl, Grid, InputLabel } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import React, { Dispatch } from 'react';
import { useQueryParams, StringParam } from 'use-query-params';

import { DateFilterInput, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy';

type DateFilterProps = {
  from?: string | null;
  to?: string | null;
  onChange?: Dispatch<DateFilterInput>;
};

const DateFilter = ({ from, to, onChange }: DateFilterProps) => {
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const inputDateFormat = format ?? DEFAULT_DATE_FORMAT;

  const [query, setQuery] = useQueryParams({
    to: StringParam,
    from: StringParam,
  });

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="date-select-label" shrink>
          Date
        </InputLabel>
        <Grid container spacing={2}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid item sm={3} xs={12}>
              <DatePicker
                format={inputDateFormat}
                label="From"
                value={from ? DateTime.fromFormat(from, inputDateFormat) : null}
                onChange={(startsAt) => {
                  alert(startsAt);
                  setQuery({
                    from: startsAt
                      ? DateTime.fromJSDate(startsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      : undefined,
                  });
                  const newValue: DateFilterInput = {
                    to: query.to,
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
                label="To"
                value={to ? DateTime.fromFormat(to, inputDateFormat) : null}
                onChange={(endsAt) => {
                  alert(endsAt);
                  setQuery({
                    to: endsAt
                      ? DateTime.fromJSDate(endsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      : undefined,
                  });
                  const newValue: DateFilterInput = {
                    to: endsAt
                      ? DateTime.fromJSDate(endsAt?.toJSDate()).toFormat(
                          inputDateFormat
                        )
                      : undefined,
                    from: query.from,
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
