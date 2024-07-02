import FormControl, { FormControlProps } from '@mui/material/FormControl';
import FormHelperText, {
  FormHelperTextProps,
} from '@mui/material/FormHelperText';
import InputLabel, { InputLabelProps } from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect, { SelectProps as MuiSelectProps } from '@mui/material/Select';
import { FieldProps, getIn } from 'formik';
import * as React from 'react';

import { Option } from 'utils/utilTypes';

export interface SelectProps
  extends FieldProps,
    Omit<MuiSelectProps, 'name' | 'value'> {
  formControl?: FormControlProps;
  formHelperText?: FormHelperTextProps;
  inputLabel?: InputLabelProps;
}

export function fieldToSelect({
  disabled,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  field: { onBlur: _onBlur, onChange: fieldOnChange, ...field },
  form: { isSubmitting, touched, errors, setFieldTouched, setFieldValue },
  onClose,
  fullWidth,
  ...props
}: Omit<
  SelectProps,
  'formControl' | 'formHelperText' | 'inputLabel'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>): MuiSelectProps & { formError: any } {
  const fieldError = getIn(errors, field.name);
  const showError = getIn(touched, field.name) && !!fieldError;

  return {
    disabled: disabled ?? isSubmitting,
    error: showError,
    formError: showError ? fieldError : undefined,
    fullWidth: fullWidth !== undefined ? fullWidth : true,
    onBlur: () => {
      // no-op
    },
    onChange:
      fieldOnChange ??
      (() => {
        // no-op
      }),
    onClose:
      onClose ??
      (async (e: React.SyntheticEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataset = (e.target as any).dataset as DOMStringMap;
        if (dataset && dataset.value) {
          await setFieldValue(field.name, dataset.value, false);
        }
        setFieldTouched(field.name, true, true);
      }),
    ...field,
    ...props,
  };
}

export default function Select({
  formControl,
  inputLabel,
  formHelperText,
  options,
  ...selectProps
}: SelectProps & { options: Option[] }) {
  if (!options) {
    throw new Error(
      'Select cannot be used without a required options property'
    );
  }

  const { error, formError, disabled, fullWidth, ...selectFieldProps } =
    fieldToSelect(selectProps);
  const { children: formHelperTextChildren, ...formHelperTextProps } =
    formHelperText || {};
  const shouldDisplayFormHelperText = error || formHelperTextChildren;

  return (
    <FormControl
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      {...formControl}
    >
      <InputLabel id={selectFieldProps.labelId} {...inputLabel}>
        {selectFieldProps.label}
      </InputLabel>
      <MuiSelect {...selectFieldProps}>
        {options.map(({ value, text }) => (
          <MenuItem value={value} key={value}>
            {text}
          </MenuItem>
        ))}
      </MuiSelect>
      {shouldDisplayFormHelperText && (
        <FormHelperText {...formHelperTextProps}>
          {error ? formError : formHelperTextChildren}
        </FormHelperText>
      )}
    </FormControl>
  );
}
