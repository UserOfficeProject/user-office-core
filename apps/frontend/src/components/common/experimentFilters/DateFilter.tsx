import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import React from 'react';

import { SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import PresetDateSelector, {
  TimeSpan,
} from '../../experiment/PresetDateSelector';

export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy';

export function getRelativeDatesFromToday(period: TimeSpan): {
  experimentStartDate?: Date;
  experimentEndDate?: Date;
} {
  const today = DateTime.local().set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  let experimentStartDate: DateTime | undefined;
  let experimentEndDate: DateTime | undefined;
  switch (period) {
    case TimeSpan.TODAY:
      experimentStartDate = today;
      experimentEndDate = today.plus({ days: 1 });
      break;
    case TimeSpan.NEXT_7_DAYS:
      experimentStartDate = today;
      experimentEndDate = today.plus({ days: 7 });
      break;
    case TimeSpan.NEXT_30_DAYS:
      experimentStartDate = today;
      experimentEndDate = today.plus({ days: 30 });
      break;
    case TimeSpan.NONE:
      experimentStartDate = undefined;
      experimentEndDate = undefined;
      break;
    default:
      throw new Error(`Unknown period: ${period}`);
  }

  return {
    experimentStartDate: experimentStartDate?.toJSDate(),
    experimentEndDate: experimentEndDate?.toJSDate(),
  };
}

interface DateFilterProps {
  experimentStartDate?: string;
  experimentEndDate?: string;
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
        <Grid item sm={4} xs={12}>
          <DatePicker
            format={inputDateFormat}
            label="From"
            value={
              props.experimentStartDate
                ? DateTime.fromFormat(
                    props.experimentStartDate,
                    format || DEFAULT_DATE_FORMAT
                  )
                : null
            }
            onChange={(startsAt) => {
              const endDate = props.experimentEndDate
                ? DateTime.fromFormat(
                    props.experimentEndDate,
                    format || DEFAULT_DATE_FORMAT
                  ).toJSDate()
                : undefined;

              props.onChange?.(inputDateFormat, startsAt?.toJSDate(), endDate);
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

        <Grid item sm={4} xs={12}>
          <DatePicker
            format={inputDateFormat}
            label="To"
            value={
              props.experimentEndDate
                ? DateTime.fromFormat(props.experimentEndDate, inputDateFormat)
                : null
            }
            onChange={(endsAt) => {
              const startDate = props.experimentStartDate
                ? DateTime.fromFormat(
                    props.experimentStartDate,
                    inputDateFormat
                  ).toJSDate()
                : undefined;

              // Set end date time to 23:59:59 if it exists
              const formattedEndDate = endsAt
                ? endsAt
                    .set({
                      hour: 23,
                      minute: 59,
                      second: 59,
                      millisecond: 999,
                    })
                    .toJSDate()
                : undefined;

              props.onChange?.(inputDateFormat, startDate, formattedEndDate);
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
        <Grid
          item
          sm={4}
          xs={12}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <PresetDateSelector
            value={presetValue}
            setValue={(val) => {
              const { experimentStartDate, experimentEndDate: rawEndDate } =
                getRelativeDatesFromToday(val);

              // Set end date time to 23:59:59 if it exists
              const experimentEndDate = rawEndDate
                ? DateTime.fromJSDate(rawEndDate)
                    .set({
                      hour: 23,
                      minute: 59,
                      second: 59,
                      millisecond: 999,
                    })
                    .toJSDate()
                : undefined;

              props.onChange?.(
                inputDateFormat,
                experimentStartDate,
                experimentEndDate
              );
              setPresetValue(val);
            }}
          />
        </Grid>
      </LocalizationProvider>
    </Grid>
  );
}

export default DateFilter;
