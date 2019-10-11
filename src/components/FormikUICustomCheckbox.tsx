import React from "react";
import { FormControlLabel, Checkbox } from "@material-ui/core";
const FormikUICustomCheckbox = ({
  field,
  checked,
  label
}: {
  field: { name: string; value: string };
  checked: boolean;
  label: string;
}) => {
  return (
    <FormControlLabel
      control={<Checkbox {...field} checked={checked} color="primary" />}
      label={label}
    />
  );
};

export default FormikUICustomCheckbox;
