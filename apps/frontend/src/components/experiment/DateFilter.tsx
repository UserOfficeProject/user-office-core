/* eslint-disable @typescript-eslint/no-explicit-any */
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import React from 'react';
import { DateTimeParam, useQueryParams } from 'use-query-params';

import { SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import PresetDateSelector, { TimeSpan } from './PresetDateSelector';

export function getRelativeDatesFromToday(period: TimeSpan): {
  from?: Date;
  to?: Date;
} {
  const today = DateTime.local().set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  let from: DateTime | undefined;
  let to: DateTime | undefined;
  switch (period) {
    case TimeSpan.TODAY:
      from = today;
      to = today.plus({ days: 1 });
      break;
    case TimeSpan.NEXT_7_DAYS:
      from = today;
      to = today.plus({ days: 7 });
      break;
    case TimeSpan.NEXT_30_DAYS:
      from = today;
      to = today.plus({ days: 30 });
      break;
    case TimeSpan.NONE:
      from = undefined;
      to = undefined;
      break;
    default:
      throw new Error(`Unknown period: ${period}`);
  }

  return { from: from?.toJSDate(), to: to?.toJSDate() };
}

interface DateFilterProps {
  from?: Date;
  to?: Date;
  onChange?: (from?: Date, to?: Date) => void;
}

function DateFilter(props: DateFilterProps) {
  const [presetValue, setPresetValue] = React.useState<TimeSpan | null>(null);
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const [, setQuery] = useQueryParams({
    from: DateTimeParam,
    to: DateTimeParam,
  });

  const inputDateFormat = format ?? 'yyyy-MM-dd';

  return (
    <Grid container spacing={2}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Grid item sm={3} xs={12}>
          <DatePicker
            format={inputDateFormat}
            label="From"
            value={(props.from as any) ?? null}
            onChange={(startsAt: unknown) => {
              setQuery({
                from: (startsAt as DateTime)?.toJSDate(),
                to: props.to,
              });
              setPresetValue(null);
            }}
            sx={(theme) => ({ marginRight: theme.spacing(1) })}
            // renderInput={(tfProps: TextFieldProps) => (
            //   <TextField
            //     {...tfProps}
            //     fullWidth
            //     data-cy="from-date-picker"
            //     margin="none"
            //   />
            // )}
          />
        </Grid>

        <Grid item sm={3} xs={12}>
          <DatePicker
            format={inputDateFormat}
            label="To"
            value={(props.to as any) ?? null}
            onChange={(endsAt: unknown) => {
              setQuery({
                from: props.from,
                to: (endsAt as DateTime)?.toJSDate(),
              });
              setPresetValue(null);
            }}
            sx={(theme) => ({ marginRight: theme.spacing(1) })}
            // renderInput={(tfProps: TextFieldProps) => (
            //   <TextField
            //     {...tfProps}
            //     fullWidth
            //     margin="none"
            //     data-cy="to-date-picker"
            //   />
            // )}
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <PresetDateSelector
            value={presetValue}
            setValue={(val) => {
              const { from, to } = getRelativeDatesFromToday(val);
              setQuery({ from, to });
              setPresetValue(val);
            }}
          />
        </Grid>
      </LocalizationProvider>
    </Grid>
  );
}

export default DateFilter;
