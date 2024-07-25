/* eslint-disable @typescript-eslint/no-unused-vars */
import { TextFieldProps } from '@mui/material/TextField';
import { PickerValidDate } from '@mui/x-date-pickers';
import {
  DateTimePicker as MuiDateTimePicker,
  DateTimePickerProps as MuiDateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker';
import { FieldProps, getIn } from 'formik';
import { DateTime } from 'luxon';
import * as React from 'react';

import { createErrorHandler } from 'utils/errorHandler';

export interface DateTimePickerProps
  extends FieldProps,
    Omit<MuiDateTimePickerProps<PickerValidDate>, 'name' | 'value' | 'error'> {
  textField?: TextFieldProps;
}

export function fieldToDateTimePicker({
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
}: DateTimePickerProps): MuiDateTimePickerProps<PickerValidDate> {
  const fieldError = getIn(errors, field.name);
  const showError = getIn(touched, field.name) && !!fieldError;
  const isStringValue = typeof value === 'string';

  return {
    slotProps: {
      textField: (textFieldProps) => ({
        ...textFieldProps,
        error: showError,
        helperText: showError ? fieldError : helperText,
        label: label,
        onBlur:
          onBlur ??
          function () {
            setFieldTouched(field.name, true, true);
          },
        ...textField,
      }),
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
      onError ?? createErrorHandler(fieldError, field.name, setFieldError),
    ...field,
    ...props,
    // TODO: Investigate this because there might be a better solution how to solve it.
    value: isStringValue ? DateTime.fromISO(value) : value,
  };
}

export default function DateTimePicker({
  children,
  ...props
}: React.PropsWithChildren<DateTimePickerProps>) {
  return (
    <MuiDateTimePicker {...fieldToDateTimePicker(props)}>
      {children}
    </MuiDateTimePicker>
  );
}
