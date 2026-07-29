import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { FieldProps, getIn } from 'formik';
import * as React from 'react';

export interface TextFieldProps
  extends FieldProps,
    Omit<MuiTextFieldProps, 'name' | 'value' | 'error'> {
  /**
   * @deprecated Material UI v9 removed `InputProps` from TextField in favour of
   * `slotProps.input`. It is still accepted here and translated below, because
   * roughly 90 call sites pass it through Formik's `<Field component={...} />`,
   * where the loose typing means neither TypeScript nor ESLint would flag it —
   * the props would simply be spread onto the root element and never reach the
   * input. Prefer `slotProps.input` in new code.
   */
  InputProps?: Record<string, unknown>;
  /**
   * @deprecated Material UI v9 removed `inputProps` from TextField in favour of
   * `slotProps.htmlInput`. See the note on `InputProps` above. This one matters
   * most: it carries `maxLength` and `data-cy` at many call sites.
   */
  inputProps?: Record<string, unknown>;
}

export function fieldToTextField({
  disabled,
  field: { onBlur: fieldOnBlur, ...field },
  form: { isSubmitting, touched, errors },
  onBlur,
  helperText,
  fullWidth,
  InputProps,
  inputProps,
  slotProps,
  ...props
}: TextFieldProps): MuiTextFieldProps {
  const fieldError = getIn(errors, field.name);
  const showError = getIn(touched, field.name) && !!fieldError;

  // `InputProps` -> `slotProps.input`, `inputProps` -> `slotProps.htmlInput`.
  // Anything already passed via `slotProps` wins, so call sites can migrate
  // one at a time without this wrapper clobbering them.
  const mergedSlotProps = {
    ...slotProps,
    ...(InputProps
      ? { input: { ...InputProps, ...(slotProps?.input as object) } }
      : {}),
    ...(inputProps
      ? { htmlInput: { ...inputProps, ...(slotProps?.htmlInput as object) } }
      : {}),
  } as MuiTextFieldProps['slotProps'];

  return {
    error: showError,
    helperText: showError ? fieldError : helperText,
    disabled: disabled ?? isSubmitting,
    fullWidth: fullWidth !== undefined ? fullWidth : true,
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

export default function TextField({ children, ...props }: TextFieldProps) {
  return <MuiTextField {...fieldToTextField(props)}>{children}</MuiTextField>;
}
