import { InputProps } from '@mui/material/Input';
import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import { Field } from 'formik';
import { Autocomplete } from 'formik-mui';
import React from 'react';

import { Option } from 'utils/utilTypes';

type FormikUIAutocompleteProps = {
  items: Option[];
  name: string;
  label: string;
  loading?: boolean;
  noOptionsText?: string;
  required?: boolean;
  disabled?: boolean;
  TextFieldProps?: MUITextFieldProps;
  InputProps?: Partial<InputProps> & { 'data-cy': string };
  'data-cy'?: string;
};

const FormikUIAutocomplete: React.FC<FormikUIAutocompleteProps> = ({
  items,
  name,
  label,
  loading = false,
  noOptionsText,
  required,
  disabled,
  InputProps,
  TextFieldProps,
  ...props
}) => {
  const options = items.map((item) => item.value);

  return (
    <Field
      id={name + '-input'}
      name={name}
      component={Autocomplete}
      loading={loading}
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
          InputProps={{ ...params.InputProps, ...InputProps }}
        />
      )}
      ListboxProps={{ 'data-cy': props['data-cy'] + '-options' }}
      data-cy={props['data-cy']}
    />
  );
};

export default FormikUIAutocomplete;
