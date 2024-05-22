import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import React, { useState } from 'react';

// type FormikUITextFieldProps = {
//   items: Option[];
//   name: string;
//   label: string;
//   loading?: boolean;
//   noOptionsText?: string;
//   required?: boolean;
//   disabled?: boolean;
//   TextFieldProps?: MUITextFieldProps;
//   InputProps?: Partial<InputProps> & { 'data-cy': string };
//   multiple?: boolean;
//   'data-cy'?: string;
//   AdornmentIcon?: MUITextFieldProps;
// };

const FormikUITextField = ({
  name,
  label,
  required,
  disabled,
  InputProps,
  ...props
}: MUITextFieldProps) => {

  return (
    
  );
};

export default FormikUITextField;
