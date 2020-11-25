/* eslint-disable @typescript-eslint/no-unused-vars */
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
      control={
        <Checkbox {...field} checked={field.value} color="primary" {...rest} />
      }
      label={label}
    />
  );
};

export default FormikUICustomCheckbox;
