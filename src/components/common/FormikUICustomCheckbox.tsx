/* eslint-disable @typescript-eslint/no-unused-vars */
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';
const FormikUICustomCheckbox = ({
  field,
  label,
  fullWidth,
  ...rest
}: {
  field: { name: string; value: boolean };
  label: string;
  fullWidth: boolean;
}) => {
  return (
    <FormControlLabel
      control={<Checkbox {...field} checked={field.value} {...rest} />}
      label={label}
    />
  );
};

export default FormikUICustomCheckbox;
