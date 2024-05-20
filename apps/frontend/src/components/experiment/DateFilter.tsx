import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import '@mui/lab';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import Grid from '@mui/material/Grid';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import React from 'react';
import { DateParam, useQueryParams } from 'use-query-params';

import { SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import PresetDateSelector, { TimeSpan } from './PresetDateSelector';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    flexDirection: 'row',
    display: 'flex',
  },
  datePicker: {
    marginRight: theme.spacing(1),
  },
}));

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
  const classes = useStyles();
  const [presetValue, setPresetValue] = React.useState<TimeSpan | null>(null);
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const [, setQuery] = useQueryParams({
    from: DateParam,
    to: DateParam,
  });

  const inputDateFormat = format ?? 'yyyy-MM-dd';

  return (
    <Grid container spacing={2}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Grid item sm={3} xs={12}>
          <DatePicker
            inputFormat={inputDateFormat}
            label="From"
            value={props.from ?? null}
            onChange={(startsAt: unknown) => {
              setQuery({
                from: (startsAt as DateTime)?.toJSDate(),
                to: props.to,
              });
              setPresetValue(null);
            }}
            className={classes.datePicker}
            renderInput={(tfProps: TextFieldProps) => (
              <TextField
                {...tfProps}
                fullWidth
                data-cy="from-date-picker"
                margin="none"
              />
            )}
          />
        </Grid>

        <Grid item sm={3} xs={12}>
          <DatePicker
            inputFormat={inputDateFormat}
            label="To"
            value={props.to ?? null}
            onChange={(endsAt: unknown) => {
              setQuery({
                from: props.from,
                to: (endsAt as DateTime)?.toJSDate(),
              });
              setPresetValue(null);
            }}
            className={classes.datePicker}
            renderInput={(tfProps: TextFieldProps) => (
              <TextField
                {...tfProps}
                fullWidth
                margin="none"
                data-cy="to-date-picker"
              />
            )}
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
