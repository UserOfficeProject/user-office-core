import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import React from 'react';
const FormikUICustomCheckbox = ({
  field,
  label,
  ...rest
}: {
  field: { name: string; value: boolean };
  label: string;
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
