/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DatePicker as MuiDatePicker,
  DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import { PickersTextFieldProps } from '@mui/x-date-pickers/PickersTextField';
import { FieldProps, getIn } from 'formik';
import { DateTime } from 'luxon';
import * as React from 'react';

import { createFormikErrorHandler } from 'utils/errorHandler';

export interface DatePickerProps
  extends FieldProps,
    Omit<MuiDatePickerProps, 'name' | 'value' | 'error'> {
  // Pickers v9 narrowed the `textField` slot to PickersTextFieldProps; it no
  // longer accepts Material UI's TextFieldProps. Typing it correctly here
  // removes the need for the cast that previously hid the mismatch.
  textField?: Partial<PickersTextFieldProps>;
}

export function fieldToDatePicker({
  field: { onChange: _onChange, value, ...field },
  form: {
    isSubmitting,
    touched,
    errors,
    setFieldValue,
    setFieldError,
    setFieldTouched,
  },
  textField: { helperText, onBlur, ...textField } = {},
  disabled,
  label,
  onChange,
  onError,
  ...props
}: DatePickerProps): MuiDatePickerProps {
  const fieldError = getIn(errors, field.name);
  const showError = getIn(touched, field.name) && !!fieldError;
  const isStringValue = typeof value === 'string';

  return {
    slotProps: {
      textField: {
        error: showError,
        helperText: showError ? fieldError : helperText,
        label: label,
        onBlur:
          onBlur ??
          function () {
            setFieldTouched(field.name, true, true);
          },
        ...textField,
      },
    },
    disabled: disabled ?? isSubmitting,
    onChange:
      onChange ??
      function (date) {
        // Do not switch this order, otherwise you might cause a race condition
        // See https://github.com/formium/formik/issues/2083#issuecomment-884831583
        setFieldTouched(field.name, true, false);
        setFieldValue(field.name, date, true);
      },
    onError:
      onError ??
      createFormikErrorHandler(fieldError, field.name, setFieldError),
    // TODO: Investigate this because there might be a better solution how to solve it.
    ...field,
    ...props,
    value: isStringValue ? DateTime.fromISO(value) : value,
  };
}

export default function DatePicker({
  children,
  ...props
}: React.PropsWithChildren<DatePickerProps>) {
  return (
    <MuiDatePicker {...fieldToDatePicker(props)}>{children}</MuiDatePicker>
  );
}
