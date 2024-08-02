import FormControl from '@mui/material/FormControl';
import useTheme from '@mui/material/styles/useTheme';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Field } from 'formik';
import { DateTime } from 'luxon';
import React from 'react';

import DatePicker from 'components/common/FormikUIDatePicker';
import DateTimePicker from 'components/common/FormikUIDateTimePicker';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateConfig, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

import Hint from '../Hint';

export function QuestionaryComponentDatePicker(props: BasicComponentProps) {
  const theme = useTheme();
  const { answer, onComplete } = props;
  const {
    question: { id, question },
  } = answer;
  const { tooltip, required, minDate, maxDate, includeTime } =
    answer.config as DateConfig;
  const { format } = useFormattedDateTime({
    settingsFormatToUse: includeTime
      ? SettingsId.DATE_TIME_FORMAT
      : SettingsId.DATE_FORMAT,
  });

  const fieldMinDate = minDate
    ? DateTime.fromISO(minDate).startOf(includeTime ? 'minute' : 'day')
    : null;
  const fieldMaxDate = maxDate
    ? DateTime.fromISO(maxDate).startOf(includeTime ? 'minute' : 'day')
    : null;

  const component = includeTime ? DateTimePicker : DatePicker;

  return (
    <FormControl margin="dense">
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          required={required}
          id={`${id}-id`}
          name={id}
          label={question}
          format={format}
          component={component}
          inputProps={{ placeholder: format }}
          ampm={false}
          onChange={(date: DateTime) =>
            date &&
            onComplete(
              includeTime ? date.startOf('minute') : date.startOf('day')
            )
          }
          textField={{
            'data-cy': `${id}.value`,
            required: required,
            margin: 'none',
          }}
          minDate={fieldMinDate}
          maxDate={fieldMaxDate}
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
        />
      </LocalizationProvider>
      <Hint>{tooltip}</Hint>
    </FormControl>
  );
}
