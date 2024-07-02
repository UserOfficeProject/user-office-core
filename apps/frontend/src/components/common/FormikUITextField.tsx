import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { FieldProps, getIn } from 'formik';
import * as React from 'react';

export interface TextFieldProps
  extends FieldProps,
    Omit<MuiTextFieldProps, 'name' | 'value' | 'error'> {}

export function fieldToTextField({
  disabled,
  field: { onBlur: fieldOnBlur, ...field },
  form: { isSubmitting, touched, errors },
  onBlur,
  helperText,
  fullWidth,
  ...props
}: TextFieldProps): MuiTextFieldProps {
  const fieldError = getIn(errors, field.name);
  const showError = getIn(touched, field.name) && !!fieldError;

  return {
    error: showError,
    helperText: showError ? fieldError : helperText,
    disabled: disabled ?? isSubmitting,
    fullWidth: fullWidth !== undefined ? fullWidth : true,
    onBlur:
      onBlur ??
      function (e) {
        fieldOnBlur(e ?? field.name);
      },
    ...field,
    ...props,
  };
}

export default function TextField({ children, ...props }: TextFieldProps) {
  return <MuiTextField {...fieldToTextField(props)}>{children}</MuiTextField>;
}
