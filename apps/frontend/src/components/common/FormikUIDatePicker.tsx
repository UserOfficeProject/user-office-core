import { TextFieldProps } from '@mui/material/TextField';
import {
  DatePicker,
  DatePickerProps as MUIDatePickerProps,
  PickerValidDate,
} from '@mui/x-date-pickers';
import { useField } from 'formik';
import React from 'react';

const FormikUIDatePicker = ({
  name,
  ...otherProps
}: MUIDatePickerProps<PickerValidDate>) => {
  if (!name) {
    throw new Error(
      'FormikUIDatePicker cannot be used without a required name property'
    );
  }

  const [field, meta, helpers] = useField(name);

  const textFieldProps: TextFieldProps = {
    name: name,
    onBlur: () => helpers.setTouched(true, true),
  };

  if (meta && meta.touched && meta.error) {
    textFieldProps.error = true;
    textFieldProps.helperText = meta.error;
  }

  const configDatePicker: MUIDatePickerProps<PickerValidDate> = {
    ...field,
    ...otherProps,
    slotProps: {
      ...otherProps,
      textField: { ...otherProps.slotProps?.textField, ...textFieldProps },
    },
  };

  return (
    <DatePicker
      {...configDatePicker}
      onChange={(value) => {
        helpers.setTouched(true, false);
        helpers.setValue(value, true);
      }}
    />
  );
};

export default FormikUIDatePicker;
