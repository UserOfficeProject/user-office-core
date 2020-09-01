import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import React from 'react';
const FormikUICustomCheckbox = ({
  field,
  checked,
  label,
  ...rest
}: {
  field: { name: string; value: string };
  checked: boolean;
  label: string;
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox {...field} checked={checked} color="primary" {...rest} />
      }
      label={label}
    />
  );
};

export default FormikUICustomCheckbox;
