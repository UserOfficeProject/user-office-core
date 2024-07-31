import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import React from 'react';

import { SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import PresetDateSelector, { TimeSpan } from './PresetDateSelector';

export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy';

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
  from?: string;
  to?: string;
  onChange?: (format: string, from?: Date, to?: Date) => void;
}

function DateFilter(props: DateFilterProps) {
  const [presetValue, setPresetValue] = React.useState<TimeSpan | null>(null);
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const inputDateFormat = format ?? DEFAULT_DATE_FORMAT;

  return (
    <Grid container spacing={2}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Grid item sm={3} xs={12}>
          <DatePicker
            format={inputDateFormat}
            label="From"
            value={
              props.from
                ? DateTime.fromFormat(props.from, inputDateFormat)
                : null
            }
            onChange={(startsAt) => {
              props.onChange?.(
                inputDateFormat,
                startsAt?.toJSDate(),
                DateTime.fromFormat(props.to!, inputDateFormat).toJSDate()
              );
              setPresetValue(null);
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
            value={
              props.to ? DateTime.fromFormat(props.to, inputDateFormat) : null
            }
            onChange={(endsAt) => {
              props.onChange?.(
                inputDateFormat,
                DateTime.fromFormat(props.from!, inputDateFormat).toJSDate(),
                endsAt?.toJSDate()
              );
              setPresetValue(null);
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
        <Grid item sm={6} xs={12}>
          <PresetDateSelector
            value={presetValue}
            setValue={(val) => {
              const { from, to } = getRelativeDatesFromToday(val);
              props.onChange?.(inputDateFormat, from, to);
              setPresetValue(val);
            }}
          />
        </Grid>
      </LocalizationProvider>
    </Grid>
  );
}

export default DateFilter;
