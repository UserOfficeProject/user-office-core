import React from "react";
import { FormControlLabel, Checkbox } from "@material-ui/core";
export const FormikUICustomCheckbox = ({ field, checked, label }: {
  field: any;
  checked: boolean;
  label: string;
}) => {
  return <FormControlLabel control={<Checkbox {...field} checked={checked} color="primary" />} label={label} />;
};
