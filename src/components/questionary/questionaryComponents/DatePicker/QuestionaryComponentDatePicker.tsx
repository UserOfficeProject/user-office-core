import { DateType } from '@date-io/type';
import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import FormControl from '@mui/material/FormControl';
import useTheme from '@mui/material/styles/useTheme';
import { Field } from 'formik';
import { DatePicker, DateTimePicker } from 'formik-mui-lab';
import { DateTime } from 'luxon';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { DateConfig } from 'generated/sdk';

import Hint from '../Hint';

export function QuestionaryComponentDatePicker(props: BasicComponentProps) {
  const theme = useTheme();
  const { answer, onComplete } = props;
  const {
    question: { id, question },
  } = answer;
  const { tooltip, required, minDate, maxDate, includeTime } =
    answer.config as DateConfig;

  const dateFormat = 'yyyy-MM-dd';
  const timeFormat = `${dateFormat} HH:mm`;

  const fieldMinDate = minDate
    ? DateTime.fromISO(minDate).startOf(includeTime ? 'minute' : 'day')
    : null;
  const fieldMaxDate = maxDate
    ? DateTime.fromISO(maxDate).startOf(includeTime ? 'minute' : 'day')
    : null;

  const getDateField = () => (
    <Field
      required={required}
      id={`${id}-id`}
      name={id}
      label={question}
      inputFormat={dateFormat}
      component={DatePicker}
      ampm={false}
      disableToolbar
      autoOk={true}
      onChange={(date: DateTime) => date && onComplete(date.startOf('day'))}
      textField={{
        'data-cy': `${id}.value`,
        required: required,
      }}
      minDate={fieldMinDate}
      maxDate={fieldMaxDate}
      desktopModeMediaQuery={theme.breakpoints.up('sm')}
    />
  );

  const getDateTimeField = () => (
    <Field
      required={required}
      id={`${id}-id`}
      name={id}
      label={question}
      ampm={false}
      inputFormat={timeFormat}
      component={DateTimePicker}
      onChange={(date: DateType | null) => {
        date && onComplete(date);
      }}
      textField={{
        'data-cy': `${id}.value`,
        required: required,
      }}
      minDate={fieldMinDate}
      maxDate={fieldMaxDate}
      desktopModeMediaQuery={theme.breakpoints.up('sm')}
    />
  );

  return (
    <FormControl margin="dense">
      <LocalizationProvider dateAdapter={DateAdapter}>
        {includeTime ? getDateTimeField() : getDateField()}
      </LocalizationProvider>
      <Hint>{tooltip}</Hint>
    </FormControl>
  );
}
