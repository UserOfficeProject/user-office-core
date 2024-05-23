import FormControl, { FormControlProps } from '@mui/material/FormControl';
import FormHelperText, {
  FormHelperTextProps,
} from '@mui/material/FormHelperText';
import InputLabel, { InputLabelProps } from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect, { SelectProps as MuiSelectProps } from '@mui/material/Select';
import { useField } from 'formik';
import React from 'react';

import { Option } from 'utils/utilTypes';

type SelectProps = MuiSelectProps & {
  options: Option[];
  formControl?: FormControlProps;
  formHelperText?: FormHelperTextProps;
  inputLabel?: InputLabelProps;
};

const FormikUISelect = ({
  name,
  options,
  formControl,
  inputLabel,
  formHelperText,
  ...otherProps
}: SelectProps) => {
  if (!name) {
    throw new Error(
      'FormikUISelect cannot be used without a required name property'
    );
  }

  if (!options) {
    throw new Error(
      'FormikUISelect cannot be used without a required options property'
    );
  }

  const [field, meta] = useField(name);

  const configSelect: SelectProps = {
    ...field,
    ...otherProps,
    options: options,
    fullWidth: true,
  };

  if (meta && meta.touched && meta.error) {
    configSelect.error = true;
  }
  const { children: formHelperTextChildren, ...formHelperTextProps } =
    formHelperText || {};

  const shouldDisplayFormHelperText = meta.error || formHelperTextChildren;

  return (
    <FormControl
      disabled={configSelect.disabled}
      error={configSelect.error}
      fullWidth={configSelect.fullWidth}
      {...formControl}
    >
      <InputLabel id={configSelect.labelId} {...inputLabel}>
        {configSelect.label}
      </InputLabel>
      <MuiSelect {...configSelect}>
        {configSelect.options.map(({ value, text }) => (
          <MenuItem value={value} key={value}>
            {text}
          </MenuItem>
        ))}
      </MuiSelect>
      {shouldDisplayFormHelperText && (
        <FormHelperText {...formHelperTextProps}>
          {configSelect.error ? configSelect.error : formHelperTextChildren}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormikUISelect;
