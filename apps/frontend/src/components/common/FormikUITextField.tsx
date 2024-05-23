import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import { useField } from 'formik';
import React from 'react';

const FormikUITextField = ({ name, ...otherProps }: MUITextFieldProps) => {
  if (!name) {
    throw new Error(
      'FormikUITextField cannot be used without a required name property'
    );
  }

  const [field, meta] = useField(name);

  const configTextField: MUITextFieldProps = {
    ...field,
    ...otherProps,
    fullWidth: true,
  };

  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }

  return <MuiTextField {...configTextField} />;
};

export default FormikUITextField;
