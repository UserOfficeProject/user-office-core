import { useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Field, useFormikContext } from 'formik';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';

import DayTimeRangePicker from 'components/common/FormikUIDayTimeRangePicker';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateTimeRangeConfig } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import Hint from '../Hint';

export function QuestionaryComponentDateTimeRangePicker(
  props: BasicComponentProps
) {
  const {
    answer,
    onComplete,
    formikProps: { errors },
  } = props;

  const {
    question: { id, question },
  } = answer;

  const { tooltip } = answer.config as DateTimeRangeConfig;
  const { format: dateTimeFormat, timezone } = useFormattedDateTime();

  const isError = !!errors[id];
  const theme = useTheme();
  const { values, setFieldValue } = useFormikContext<{
    startEndDate: { from: string; to: string };
  }>();

  // Writes dateTimeRange to db after the user selects it.
  useEffect(() => {
    onComplete({ dateTimeRanges: [values.startEndDate] });
  }, [values.startEndDate]);

  // Sets the UI from the db on page load.
  useEffect(() => {
    const dateTimeRange = answer?.value?.dateTimeRanges?.[0];

    if (dateTimeRange) {
      setFieldValue('startEndDate', {
        from: DateTime.fromISO(dateTimeRange.from),
        to: DateTime.fromISO(dateTimeRange.to),
      });
    }
  }, []);

  return (
    <FormControl margin="dense" error={isError}>
      <FormLabel
        sx={{
          mb: 1,
          fontWeight: 500,
          color: 'text.primary',
        }}
      >
        {question}
      </FormLabel>

      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          name="startEndDate"
          label={`Start and End date (${timezone})`}
          id="start-end-call-input"
          format={dateTimeFormat}
          ampm={false}
          component={DayTimeRangePicker}
          inputProps={{ placeholder: dateTimeFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            required: true,
            'data-cy': 'start-end-date',
          }}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
      </LocalizationProvider>

      <Hint>{tooltip}</Hint>

      {isError && <FormHelperText>{errors[id]?.toString()}</FormHelperText>}
    </FormControl>
  );
}
