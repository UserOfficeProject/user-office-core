import MuiCheckbox, {
  CheckboxProps as MuiCheckboxProps,
} from '@mui/material/Checkbox';
import FormControlLabel, {
  FormControlLabelProps as MuiFormControlLabelProps,
} from '@mui/material/FormControlLabel';
import { FieldProps } from 'formik';
import * as React from 'react';

export interface CheckboxProps
  extends FieldProps,
    Omit<
      MuiCheckboxProps,
      | 'name'
      | 'value'
      | 'error'
      | 'form'
      | 'checked'
      | 'defaultChecked'
      // Excluded for conflict with Field type
      | 'type'
    > {
  type?: string;
  /**
   * @deprecated Material UI v9 removed `inputProps` from Checkbox in favour of
   * `slotProps.input`. Accepted here and translated below so the existing call
   * sites keep applying their `data-cy` attributes to the real input element.
   */
  inputProps?: Record<string, unknown>;
  /**
   * @deprecated Material UI v9 removed `InputProps` from Checkbox. Checkbox has
   * no such slot; the call sites that pass it mean the html input.
   */
  InputProps?: Record<string, unknown>;
}

export function fieldToCheckbox({
  disabled,
  field: { onBlur: fieldOnBlur, ...field },
  form: { isSubmitting },
  onBlur,
  inputProps,
  InputProps,
  slotProps,
  ...props
}: CheckboxProps): MuiCheckboxProps {
  const indeterminate = !Array.isArray(field.value) && field.value == null;

  const legacyInputProps = { ...InputProps, ...inputProps };
  const mergedSlotProps = {
    ...slotProps,
    ...(Object.keys(legacyInputProps).length
      ? { input: { ...legacyInputProps, ...(slotProps?.input as object) } }
      : {}),
  } as MuiCheckboxProps['slotProps'];

  return {
    disabled: disabled ?? isSubmitting,
    indeterminate,
    onBlur:
      onBlur ??
      function (e) {
        fieldOnBlur(e ?? field.name);
      },
    slotProps: mergedSlotProps,
    ...field,
    ...props,
  };
}

/**
 * Exclude props that are passed directly to the control
 * https://github.com/mui-org/material-ui/blob/v3.1.1/packages/material-ui/src/FormControlLabel/FormControlLabel.js#L71
 */
export interface CheckboxWithLabelProps extends FieldProps, CheckboxProps {
  Label: Omit<
    MuiFormControlLabelProps,
    'checked' | 'name' | 'value' | 'control'
  >;
}

export default function CheckboxWithLabel({
  Label,
  ...props
}: CheckboxWithLabelProps) {
  return (
    <FormControlLabel
      control={<MuiCheckbox {...fieldToCheckbox(props)} />}
      {...Label}
    />
  );
}
