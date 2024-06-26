/* eslint-disable @typescript-eslint/no-unused-vars */
import MuiAutocomplete, {
  AutocompleteProps as MuiAutocompleteProps,
} from '@mui/material/Autocomplete';
import { InputProps } from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import { FieldProps } from 'formik';
import { Field } from 'formik';
import React, { useState } from 'react';
import invariant from 'tiny-warning';

import { Option } from 'utils/utilTypes';

export type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';

export interface AutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends FieldProps,
    Omit<
      MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
      'name' | 'value' | 'defaultValue'
    > {
  type?: string;
}

export function fieldToAutocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>({
  disabled,
  field,
  form: { isSubmitting, setFieldValue },
  type,
  onChange,
  onBlur,
  freeSolo,
  ...props
}: AutocompleteProps<
  T,
  Multiple,
  DisableClearable,
  FreeSolo
>): MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  if (process.env.NODE_ENV !== 'production') {
    if (props.multiple) {
      invariant(
        Array.isArray(field.value),
        `value for ${field.name} is not an array, this can caused unexpected behaviour`
      );
    }
  }

  const {
    onChange: _onChange,
    onBlur: _onBlur,
    multiple: _multiple,
    ...fieldSubselection
  } = field;

  return {
    freeSolo,
    onBlur:
      onBlur ??
      function (event) {
        field.onBlur(event ?? field.name);
      },
    onChange:
      onChange ??
      function (_event, value) {
        setFieldValue(field.name, value);
      },
    disabled: disabled ?? isSubmitting,
    loading: isSubmitting,
    ...fieldSubselection,
    ...props,
  };
}

function Autocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>(props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  return <MuiAutocomplete {...fieldToAutocomplete(props)} />;
}

type FormikUIAutocompleteProps = {
  items: Option[];
  name: string;
  label: string;
  loading?: boolean;
  noOptionsText?: string;
  required?: boolean;
  disabled?: boolean;
  TextFieldProps?: MUITextFieldProps;
  InputProps?: Partial<InputProps> & { 'data-cy'?: string };
  multiple?: boolean;
  'data-cy'?: string;
};

const FormikUIAutocomplete = ({
  items,
  name,
  label,
  loading = false,
  noOptionsText,
  required,
  disabled,
  InputProps,
  TextFieldProps,
  multiple = false,
  ...props
}: FormikUIAutocompleteProps) => {
  const [adornmentVisible, setAdornmentVisible] = useState(false);
  const options = items.map((item) => item.value);

  return (
    <Field
      id={name + '-input'}
      name={name}
      component={Autocomplete}
      loading={loading}
      multiple={multiple}
      options={options}
      noOptionsText={noOptionsText}
      getOptionLabel={(option: number | string) => {
        const foundOption = items.find((item) => item.value === option);

        return foundOption?.text || '';
      }}
      renderInput={(params: MUITextFieldProps) => (
        <MuiTextField
          {...params}
          {...TextFieldProps}
          label={label}
          required={required}
          disabled={disabled}
          InputProps={{
            ...params.InputProps,
            ...InputProps,
            endAdornment: (
              <InputAdornment position="start">
                {InputProps?.endAdornment && adornmentVisible
                  ? InputProps.endAdornment
                  : null}{' '}
                {params.InputProps?.endAdornment}
              </InputAdornment>
            ),
          }}
          onFocus={() => {
            setAdornmentVisible(true);
          }}
          onBlur={() => {
            setAdornmentVisible(false);
          }}
        />
      )}
      ListboxProps={{ 'data-cy': props['data-cy'] + '-options' }}
      data-cy={props['data-cy']}
    />
  );
};

export default FormikUIAutocomplete;
